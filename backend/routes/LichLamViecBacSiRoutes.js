const express = require('express');
const LichLamViecBacSiController = require('../controllers/LichLamViecBacSiController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.checkRole(['QuanTri', 'QuanLy', 'LeTan', 'BacSi']));


// CRUD operations
router.get('/', LichLamViecBacSiController.getAll);
router.get('/:id', LichLamViecBacSiController.getById);
router.post('/', LichLamViecBacSiController.create);
router.put('/:id', LichLamViecBacSiController.update);
router.delete('/:id', LichLamViecBacSiController.delete);

module.exports = router;
