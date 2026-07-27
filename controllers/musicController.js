const NodeCache = require('node-cache');
const jiosaavnService = require('../services/jiosaavnService');

// Cache configuration (standard TTL: 1 hour)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const getTrending = async (req, res) => {
  try {
    const cacheKey = 'trending';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.status(200).json({ success: true, data: cachedData });

    const data = await jiosaavnService.getTrending();
    cache.set(cacheKey, data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trending data' });
  }
};

const searchSongs = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, error: 'Query is required' });

    const cacheKey = `search_${query}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.status(200).json({ success: true, data: cachedData });

    const data = await jiosaavnService.searchSongs(query);
    cache.set(cacheKey, data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
};

const getSongDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `song_${id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.status(200).json({ success: true, data: cachedData });

    const data = await jiosaavnService.getSongDetails(id);
    cache.set(cacheKey, data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Song not found' });
  }
};

const getLyrics = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await jiosaavnService.getLyrics(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Lyrics not found' });
  }
};

module.exports = {
  getTrending,
  searchSongs,
  getSongDetails,
  getLyrics
};
