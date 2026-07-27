const jiosaavnService = require('../services/jiosaavnService.js');

const searchSongs = async (req, res) => {
    try {
        const query = req.query.query || req.query.q;
        
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: "Search query is required." 
            });
        }

        console.log(`[DEBUG] Received search query: ${query}`);
        const results = await jiosaavnService.searchSongs(query);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error("[ERROR] Search Controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error while searching for songs.",
            error: error.message 
        });
    }
};

const getSong = async (req, res) => {
    try {
        const songId = req.query.id; 
        
        if (!songId) {
            return res.status(400).json({ 
                success: false, 
                message: "Song ID is required. Pass it as ?id=..." 
            });
        }
        
        console.log(`[DEBUG] Fetching details for song ID: ${songId}`);
        const songDetails = await jiosaavnService.getSongDetails(songId);
        
        if (!songDetails) {
            return res.status(404).json({ 
                success: false, 
                message: "Song not found." 
            });
        }
        
        res.json({
            success: true,
            data: songDetails
        });
    } catch (error) {
        console.error("[ERROR] Get Song Controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error while fetching song details.",
            error: error.message 
        });
    }
};

module.exports = {
    searchSongs,
    getSong
};
