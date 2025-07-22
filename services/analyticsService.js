const VisitorEvent = require('../models/VisitorEvent');

const getSummary = async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const totalToday = await VisitorEvent.countDocuments({ timestamp: { $gte: today } });
    const totalActive = await VisitorEvent.distinct('sessionId', {
        timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // last 10 min
    });

    const events = await VisitorEvent.find({ timestamp: { $gte: today } });

    const pagesVisited = events.reduce((acc, curr) => {
        acc[curr.page] = (acc[curr.page] || 0) + 1;
        return acc;
    }, {});

    return {
        totalToday,
        totalActive: totalActive.length,
        pagesVisited,
    };
};

const getSessions = async () => {
  const events = await VisitorEvent.find({}).sort({ timestamp: 1 });

  const sessions = {};

  events.forEach(event => {
    const { sessionId, page, timestamp } = event;
    const time = new Date(timestamp);

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        sessionId,
        journey: [],
        start: time,
        end: time,
      };
    }

    sessions[sessionId].journey.push(page);
    sessions[sessionId].end = time; // update latest timestamp
  });

  return Object.values(sessions).map(s => ({
    ...s,
    duration: (s.end - s.start) / 1000  // seconds
  }));
};

module.exports = { getSummary, getSessions };
