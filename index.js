const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

// Route to search for a list of songs
router.get('/search/songs', musicController.searchSongs);

// Route to get the full playable details of a single song using its ID
router.get('/songs', musicController.getSong);

module.exports = router;
