const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Music API is running.' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
