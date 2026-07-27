const jiosaavnService = require('../services/jiosaavnService');

const searchSongs = async (req, res) => {
    try {
        const query = req.query.query || req.query.q;
        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        const results = await jiosaavnService.searchSongs(query);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error("Search Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSong = async (req, res) => {
    try {
        const songId = req.query.id; 
        if (!songId) {
            return res.status(400).json({ success: false, message: "Song ID is required" });
        }
        
        const songDetails = await jiosaavnService.getSongDetails(songId);
        
        if (!songDetails) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }
        
        res.json({
            success: true,
            data: songDetails
        });
    } catch (error) {
        console.error("Get Song Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    searchSongs,
    getSong
};
