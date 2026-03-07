const express = require('express');
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected routes
router.get('/me', AuthMiddleware.verifyToken, AuthController.getCurrentUser);
router.post('/change-password', AuthMiddleware.verifyToken, AuthController.changePassword);

module.exports = router;
