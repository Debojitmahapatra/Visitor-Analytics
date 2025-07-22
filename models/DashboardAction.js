const mongoose = require('mongoose');

const dashboardActionSchema = new mongoose.Schema({
  action: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DashboardAction', dashboardActionSchema);
