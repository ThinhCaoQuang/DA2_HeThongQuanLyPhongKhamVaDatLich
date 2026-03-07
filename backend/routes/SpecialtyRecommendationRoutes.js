const express = require('express');
const SpecialtyRecommendationController = require('../controllers/SpecialtyRecommendationController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Public routes (no auth required)
router.post('/recommend', SpecialtyRecommendationController.recommendBySymptoms);
router.get('/list', SpecialtyRecommendationController.getAllSpecialties);

module.exports = router;
