const express = require('express');
const router = express.Router();
const BenhNhanController = require('../controllers/BenhNhanController');

// GET all
router.get('/', BenhNhanController.getAll);

// GET by ID
router.get('/:id', BenhNhanController.getById);

// CREATE
router.post('/', BenhNhanController.create);

// UPDATE
router.put('/:id', BenhNhanController.update);

// DELETE
router.delete('/:id', BenhNhanController.delete);

module.exports = router;
