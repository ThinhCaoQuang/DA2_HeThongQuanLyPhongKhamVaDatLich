const express = require('express');
const router = express.Router();
const LichKhamController = require('../controllers/LichKhamController');

// GET all
router.get('/', LichKhamController.getAll);

// GET by ID
router.get('/:id', LichKhamController.getById);

// CREATE
router.post('/', LichKhamController.create);

// UPDATE
router.put('/:id', LichKhamController.update);

// DELETE
router.delete('/:id', LichKhamController.delete);

// Xác nhận lịch khám
router.patch('/:id/confirm', LichKhamController.confirm);

// Hủy lịch khám
router.patch('/:id/cancel', LichKhamController.cancel);

module.exports = router;
