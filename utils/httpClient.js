const axios = require('axios');
const axiosRetry = require('axios-retry').default;

const httpClient = axios.create({
  baseURL: 'https://www.jiosaavn.com/api.php',
  timeout: 10000,
  headers: {
    'Accept': 'application/json, text/plain, */*'
  }
});

// Implement retry logic for external API resilience
axiosRetry(httpClient, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return error.response?.status >= 500 || error.code === 'ECONNABORTED';
  }
});

module.exports = httpClient;
