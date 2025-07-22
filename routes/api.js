const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');

router.post('/events', controller.postEvent);   //!Receives visitor events:

router.get('/analytics/summary', controller.getSummary);     //! Returns current statistics

router.get('/analytics/sessions', controller.getSessions);     //! Returns active sessions with their journey

module.exports = router;
