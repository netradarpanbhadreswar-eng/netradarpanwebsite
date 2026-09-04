const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// REST API Router
app.use('/api', apiRoutes);

// Static frontend file serving for standalone node / local environment
app.use(express.static(path.join(__dirname, '..')));

// Fallback for HTML routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Express server if executed directly
if (require.main === module) {
    app.listen(env.PORT, () => {
        console.log(`====================================================`);
        console.log(` Netradarpan Eye Hospital Express Backend Server`);
        console.log(` Server running on: http://localhost:${env.PORT}`);
        console.log(` REST API Base URL:  http://localhost:${env.PORT}/api`);
        console.log(`====================================================`);
    });
}

module.exports = app;
