const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

router.get('/trending', musicController.getTrending);
router.get('/search/songs', musicController.searchSongs);
router.get('/songs/:id', musicController.getSongDetails);
router.get('/lyrics/:id', musicController.getLyrics);

// Placeholders for expanded functionality to match requirements architecture
router.get('/albums/:id', (req, res) => res.status(501).json({ error: 'Not implemented yet' }));
router.get('/artists/:id', (req, res) => res.status(501).json({ error: 'Not implemented yet' }));
router.get('/playlists/:id', (req, res) => res.status(501).json({ error: 'Not implemented yet' }));

module.exports = router;
