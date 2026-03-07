const express = require('express');
const BacSiController = require('../controllers/BacSiController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// READ operations - allowed for QuanTri, LeTan and BacSi
router.get('/', AuthMiddleware.checkRole(['QuanTri', 'LeTan', 'BacSi']), BacSiController.getAll);
router.get('/:id', AuthMiddleware.checkRole(['QuanTri', 'LeTan', 'BacSi']), BacSiController.getById);

// CREATE, UPDATE, DELETE operations - only for QuanTri (Admin)
router.post('/', AuthMiddleware.checkRole(['QuanTri']), BacSiController.create);
router.put('/:id', AuthMiddleware.checkRole(['QuanTri']), BacSiController.update);
router.delete('/:id', AuthMiddleware.checkRole(['QuanTri']), BacSiController.delete);

// Add specialty to doctor - only for QuanTri (Admin)
router.post('/:id/specialty', AuthMiddleware.checkRole(['QuanTri']), BacSiController.addSpecialty);

// Create BacSi record from existing NguoiDung account - only for QuanTri (Admin)
router.post('/promote-to-doctor', AuthMiddleware.checkRole(['QuanTri']), BacSiController.createBacSiFromNguoiDung);

module.exports = router;
