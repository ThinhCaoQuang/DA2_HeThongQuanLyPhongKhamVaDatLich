const express = require('express');
const router = express.Router();
const ChuyenKhoaController = require('../controllers/ChuyenKhoaController');

// GET all
router.get('/', ChuyenKhoaController.getAll);

// GET by ID
router.get('/:id', ChuyenKhoaController.getById);

// CREATE
router.post('/', ChuyenKhoaController.create);

// UPDATE
router.put('/:id', ChuyenKhoaController.update);

// DELETE
router.delete('/:id', ChuyenKhoaController.delete);

module.exports = router;
