const pool = require('../db/db');

class UserController {
    // Create a new user
    static async createUser(req, res) {
        try {
            const { name, regno } = req.body;

            if (!name || !regno) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and regno are required'
                });
            }

            const result = await pool.query(
                `INSERT INTO users (name, regno) 
                 VALUES ($1, $2) 
                 RETURNING user_id, name, regno, created_at`,
                [name, regno]
            );

            res.status(201).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating user'
            });
        }
    }

    // Get all users
    static async getAllUsers(req, res) {
        try {
            const result = await pool.query(
                'SELECT user_id, name, regno, created_at FROM users ORDER BY created_at DESC'
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching users'
            });
        }
    }

    // Get user by ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query(
                'SELECT user_id, name, regno, created_at FROM users WHERE user_id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user'
            });
        }
    }

    // Update user
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { name, regno } = req.body;

            const result = await pool.query(
                `UPDATE users 
                 SET name = $1, regno = $2 
                 WHERE user_id = $3
                 RETURNING user_id, name, regno, created_at`,
                [name, regno, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating user'
            });
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting user'
            });
        }
    }
}

module.exports = UserController;