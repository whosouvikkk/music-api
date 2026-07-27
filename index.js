const express = require('express');
const cors = require('cors');
const routes = require('./routes/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "JioSaavn Music API Wrapper is running."
    });
});

// API Routes
app.use('/api', routes);

// Export for Vercel Serverless environment, listen only if local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
