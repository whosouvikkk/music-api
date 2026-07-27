const express = require('express');
const router = express.Router();

// Explicit .js extension prevents Vercel serverless resolution errors
const musicController = require('../controllers/musicController.js');

// Route to search for songs
router.get('/search/songs', musicController.searchSongs);

// Route to get a song's details along with the decrypted playable URL
router.get('/songs', musicController.getSong);

module.exports = router;
