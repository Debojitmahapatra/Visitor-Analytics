


const mongoose = require('mongoose');
const app = require('./app');
const { port, mongoURI } = require('./config');

//?For installing websocket
const http = require('http');
const initSocket = require('./socket');

const server = http.createServer(app); // Use HTTP server
initSocket(server); // Initialize WebSocket


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
  })
  .catch(err => console.error(err));



//Real-Time Visitor Analytics System


