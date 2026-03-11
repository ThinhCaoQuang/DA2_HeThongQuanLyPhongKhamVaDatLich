const express = require('express');
const BenhNhanController = require('../controllers/BenhNhanController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication and LeTan/QuanTri/BacSi role
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.checkRole(['LeTan', 'QuanTri', 'QuanLy', 'BacSi']));

// CRUD operations
router.get('/', BenhNhanController.getAll);
router.get('/:id', BenhNhanController.getById);
router.post('/', BenhNhanController.create);
router.put('/:id', BenhNhanController.update);
router.delete('/:id', BenhNhanController.delete);

module.exports = router;
