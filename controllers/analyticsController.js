const VisitorEvent = require('../models/VisitorEvent');
const analyticsService = require('../services/analyticsService');
const { emitVisitorUpdate } = require('../socket');
const { validateVisitorEvent } = require('../utils/validateEvent');


 

exports.postEvent = async (req, res) => {
  try {
     const { isValid, errors } = validateVisitorEvent(req.body);

  if (!isValid) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  //store data in db
    const event = await VisitorEvent.create(req.body);

    //? to get total active Today dashboard, totalActive right now , which pages is Visited

    const summary = await analyticsService.getSummary();
    console.log(summary);
    
    //  emit to clients and Track sessions

 emitVisitorUpdate(event, summary);


    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.getSummary = async (req, res) => {
  try {

    //? to get total active Today dashboard, totalActive right now , which pages is Visited
       
    const summary = await analyticsService.getSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
          //? to get   sessionId,  journey  and duration

    const sessions = await analyticsService.getSessions();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
