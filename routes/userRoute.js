const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');


router.post('/users/login', userController.userLogin)
router.post('/users/storypitched', userController.storyPtiched)
router.get('/users/getallstory', userController.getAllStory)

module.exports = router;