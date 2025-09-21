const express = require('express');
const router = express.Router();
const AdminController = require('../controller/adminController');

// POST http://localhost:3000/api/admins - Create a new admin
router.post('/', AdminController.createAdmin);

// GET http://localhost:3000/api/admins - Get all admins
router.get('/', AdminController.getAllAdmins);

// GET http://localhost:3000/api/admins/:id - Get admin by ID (e.g., /api/admins/1)
router.get('/:id', AdminController.getAdminById);

// PUT http://localhost:3000/api/admins/:id - Update admin (e.g., /api/admins/1)
router.put('/:id', AdminController.updateAdmin);

// DELETE http://localhost:3000/api/admins/:id - Delete admin (e.g., /api/admins/1)
router.delete('/:id', AdminController.deleteAdmin);

module.exports = router;