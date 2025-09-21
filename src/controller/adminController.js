const pool = require('../db/db');
const bcrypt = require('bcrypt');

class AdminController {
    // Create a new admin
    static async createAdmin(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            // Hash the password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const result = await pool.query(
                `INSERT INTO admins (name, email, password_hash) 
                 VALUES ($1, $2, $3) 
                 RETURNING admin_id, name, email, created_at`,
                [name, email, password_hash]
            );

            res.status(201).json({
                success: true,
                message: "Admin Account Created Successfully!!",
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating admin'
            });
        }
    }

    // Get all admins
    static async getAllAdmins(req, res) {
        try {
            const result = await pool.query(
                'SELECT admin_id, name, email, created_at, updated_at FROM admins ORDER BY created_at DESC'
            );

            res.status(200).json({
                success: true,
                message: "Fetched all admins successfully",
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching admins'
            });
        }
    }

    // Get admin by ID
    static async getAdminById(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query(
                'SELECT admin_id, name, email, created_at, updated_at FROM admins WHERE admin_id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.status(200).json({
                success: true,
                message: "Fetched admin successfully",
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching admin'
            });
        }
    }

    // Update admin
    static async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            const result = await pool.query(
                `UPDATE admins 
                 SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
                 WHERE admin_id = $3
                 RETURNING admin_id, name, email, created_at, updated_at`,
                [name, email, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.status(200).json({
                success: true,
                message: "Admin updated successfully",
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating admin'
            });
        }
    }

    // Delete admin
    static async deleteAdmin(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('DELETE FROM admins WHERE admin_id = $1 RETURNING admin_id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Admin deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting admin'
            });
        }
    }
}

module.exports = AdminController;