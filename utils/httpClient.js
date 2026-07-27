const axios = require('axios');

const httpClient = {
    get: async (url, config = {}) => {
        const response = await axios.get(url, config);
        return response.data;
    }
};

module.exports = httpClient;
