const express = require('express');
const cors = require('cors');
const routes = require('./routes/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "JioSaavn Music API is running smoothly!"
    });
});

// API Routes
app.use('/api', routes);

// Local development listener
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

// Export app for Vercel Serverless execution
module.exports = app;
