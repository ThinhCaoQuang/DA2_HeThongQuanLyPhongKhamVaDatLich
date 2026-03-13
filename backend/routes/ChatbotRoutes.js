const express = require('express');
const ChatbotController = require('../controllers/ChatbotController');

const router = express.Router();

router.post('/message', ChatbotController.sendMessage);

module.exports = router;
