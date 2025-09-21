const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');

// POST http://localhost:3000/api/users - Create a new user
router.post('/', UserController.createUser);

// GET http://localhost:3000/api/users - Get all users
router.get('/', UserController.getAllUsers);

// GET http://localhost:3000/api/users/:id - Get user by ID (e.g., /api/users/1)
router.get('/:id', UserController.getUserById);

// PUT http://localhost:3000/api/users/:id - Update user (e.g., /api/users/1)
router.put('/:id', UserController.updateUser);

// DELETE http://localhost:3000/api/users/:id - Delete user (e.g., /api/users/1)
router.delete('/:id', UserController.deleteUser);

module.exports = router;