const express = require('express');
const ChuyenKhoaController = require('../controllers/ChuyenKhoaController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// Get specialties (all roles can view)
router.get('/', ChuyenKhoaController.getAll);
router.get('/:id', ChuyenKhoaController.getById);

// Create/Update/Delete (QuanTri only)
router.post('/', AuthMiddleware.checkRole(['QuanTri']), ChuyenKhoaController.create);
router.put('/:id', AuthMiddleware.checkRole(['QuanTri']), ChuyenKhoaController.update);
router.delete('/:id', AuthMiddleware.checkRole(['QuanTri']), ChuyenKhoaController.delete);

module.exports = router;
