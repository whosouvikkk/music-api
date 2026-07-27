const express = require('express');
const router = express.Router();

// Using exact .js extension to avoid Vercel module resolution errors
const musicController = require('../controllers/musicController.js');

router.get('/search/songs', musicController.searchSongs);
router.get('/songs', musicController.getSong);

module.exports = router;
