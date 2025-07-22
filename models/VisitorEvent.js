const mongoose = require('mongoose');

const visitorEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pageview', 'click', 'session_end'],
    required: true
  },
  page: String,
  sessionId: { type: String, required: true },
  timestamp: {
  type: Date,
  default: Date.now
},
  country: {type:String},
  metadata: {
    device: String,
    referrer: String,
  }
});

module.exports = mongoose.model('VisitorEvent', visitorEventSchema);
