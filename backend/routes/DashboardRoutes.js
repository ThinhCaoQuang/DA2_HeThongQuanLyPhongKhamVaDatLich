const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get statistics
router.get('/statistics', DashboardController.getStatistics);

module.exports = router;
