const express = require('express');
const router = express.Router();
const BacSiController = require('../controllers/BacSiController');

// GET all
router.get('/', BacSiController.getAll);

// GET by ID
router.get('/:id', BacSiController.getById);

// UPDATE
router.put('/:id', BacSiController.update);

// DELETE
router.delete('/:id', BacSiController.delete);

module.exports = router;
