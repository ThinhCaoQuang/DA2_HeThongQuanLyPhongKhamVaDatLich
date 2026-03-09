const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get statistics
router.get('/statistics', DashboardController.getStatistics);

// Cancellation statistics routes
router.get('/cancellation-statistics', DashboardController.getCancellationStatistics);
router.get('/cancellation-trends', DashboardController.getCancellationTrends);
router.get('/cancellation-reasons', DashboardController.getCancellationReasons);
router.get('/cancellation-by-doctor', DashboardController.getCancellationByDoctor);
router.get('/cancellation-by-specialty', DashboardController.getCancellationBySpecialty);

module.exports = router;
