const { Server } = require('socket.io');
const VisitorEvent = require('./models/VisitorEvent');
const DashboardAction = require('./models/DashboardAction');
const analyticsService = require('./services/analyticsService')



let connectedAt;
let disConnectedAt;
let diff;
let io;
let dashboardCount = 0;

const sessionJourneys = {}; // { sessionId: { journey: [], startTime } }

async function initSocket(server) {
    // Create a new Socket.IO server instance, allowing CORS from any origin
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Get the summary of today's users from the analytics service

    let todayUsers = await analyticsService.getSummary();
    let totalToday = todayUsers.totalToday;

    // Listen for new dashboard connections
    
    io.on('connection', (socket) => {
        dashboardCount++;          // Increment the count of connected dashboards
        connectedAt = new Date();     // Track the time this dashboard connected

        console.log(`Dashboard connected: ${socket.id}`);

        //* Notify all connected clients about the new connection

        io.emit('user_connected', {
            type: 'user_connected',
            data: {
                id: socket.id,
                totalDashboards: dashboardCount,
                connectedAt,
                totalToday
            }
        });

        //* Notify all connected clients about the dashboard disconnection

        socket.on('disconnect', () => {
            dashboardCount--;               // Decrease dashboard count

            console.log(`Dashboard disconnected: ${socket.id}`);

            disConnectedAt = new Date();  //  disconnect time
            diff = (disConnectedAt - connectedAt) / 1000; // Calculate the diff
            console.log(diff);

            //* Notify all clients that a dashboard has disconnected

            io.emit('user_disconnected', {
                type: 'user_disconnected',
                data: {
                    id: socket.id,
                    totalDashboards: dashboardCount,
                    disConnectedAt,
                    diff // duration of connection
                }
            });
        });

        //* Handle message sent from dashboard 

        socket.on('send_message', (payload) => {
            console.log('Message received:', payload);

            // Broadcast an alert to all connected dashboards
            io.emit('alert', {
                type: 'alert',
                data: {
                    level: payload.data.level, // e.g., info, warning
                    message: payload.data.message,
                    sessionId: payload.data.sessionId || null, // optional session-specific message
                    details: {
                        sentAt: payload.data.sentAt,         // timestamp of message
                        sender: socket.id                    // who sent the message
                    }
                }
            });
        });

        //* Listen for filtered requests from the dashboard

        socket.on('request_detailed_stats', async (payload) => {
            const filter = {};               //create for search data in db
            if (payload.filter?.country) filter.country = payload.filter.country;
            if (payload.filter?.page) filter.page = payload.filter.page;

            // Find matching events in MongoDB
            const filteredEvents = await VisitorEvent.find(filter).sort({ timestamp: 1 });

            // Send filtered data back to the requesting dashboard
            socket.emit('filtered_stats', {
                type: 'filtered_stats',
                data: filteredEvents
            });
        });

        //* Track dashboard UI actions like filter clicks, etc.
        socket.on('track_dashboard_action', async (payload) => {
            try {
                const action = await DashboardAction.create(payload); // Save to DashboardAction DB
                console.log('Dashboard action saved:', action);
            } catch (err) {
                console.error('Failed to save dashboard action:', err.message);
            }
        });
    });
}

function emitVisitorUpdate(event, summary) {
    // Exit early if WebSocket server (`io`) is not available
    if (!io) return;

    //* Emit a real-time update to all connected dashboards and Sends the new event and updated summary 

    io.emit('visitor_update', {
        type: 'visitor_update',
        data: {
            event,           // The raw visitor event (like 'pageview')
            stats: summary   // Updated analytics summary (total visitors, active sessions, etc.)
        }
    });

    //* Track the session journey for this visitor
    const sessionId = event.sessionId;

    //* If this is the first event for this session store data in sessionJourneys
    if (!sessionJourneys[sessionId]) {
        sessionJourneys[sessionId] = {
            journey: [],                             // Holds list of pages visited
            startTime: new Date(event.timestamp)     // Track when the session began
        };
    }

    //* Add the current page to the visitor's journey
    sessionJourneys[sessionId].journey.push(event.page);

    const currentJourney = sessionJourneys[sessionId];

    //* Emit a session_activity event to show the visitor’s current state

    io.emit('session_activity', {
        type: 'session_activity',
        data: {
            sessionId,                           // Unique visitor/session ID
            currentPage: event.page,             // Current page visited
            journey: currentJourney.journey,     // Full list of visited pages
            duration: (new Date(event.timestamp) - currentJourney.startTime) / 1000  // Total time (in seconds) since session started           
        }
    });
}


module.exports = initSocket;
module.exports.emitVisitorUpdate = emitVisitorUpdate;
