const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { initWPP } = require('./wpp');

const app = express();
const PORT = 3000;

const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

// Log middleware
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync(path.join(__dirname, 'logs.txt'), log);
    next();
});

// Load routes
app.use('/', routes);

// Start Server and WPP
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    initWPP();
});
