const axios = require('axios');

// Configure base HTTP client with standard headers mimicking a browser
// This helps prevent getting blocked by JioSaavn's API rate limiters
const httpClient = axios.create({
    baseURL: 'https://www.jiosaavn.com/api.php',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

module.exports = httpClient;
