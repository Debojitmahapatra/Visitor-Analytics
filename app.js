const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');


const app = express();
app.use(express.static(path.join(__dirname, 'public')));   // to serve static files (HTML, CSS, js)

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

module.exports = app;
