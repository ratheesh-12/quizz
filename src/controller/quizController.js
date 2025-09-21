const pool = require('../db/db');

class QuizController {
    // Generate a unique 5-digit token
    static generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 5; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    // Create a new quiz
    static async createQuiz(req, res) {
        try {
            const { admin_id, quiz_name, description, total_mark, is_active } = req.body;

            if (!admin_id || !quiz_name || !total_mark) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin ID, quiz name, and total mark are required'
                });
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                let quiz_token;
                let isUnique = false;

                // Generate unique token
                while (!isUnique) {
                    quiz_token = QuizController.generateToken();
                    
                    const tokenCheck = await client.query(
                        'SELECT quiz_id FROM quizzes WHERE quiz_token = $1',
                        [quiz_token]
                    );

                    if (tokenCheck.rows.length === 0) {
                        isUnique = true;
                    }
                }

                const result = await client.query(
                    `INSERT INTO quizzes (admin_id, quiz_name, description, total_mark, quiz_token, is_active) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     RETURNING quiz_id, admin_id, quiz_name, description, total_mark, quiz_token, is_active, created_at`,
                    [admin_id, quiz_name, description, total_mark, quiz_token, is_active !== undefined ? is_active : true]
                );

                await client.query('COMMIT');

                res.status(201).json({
                    success: true,
                    data: result.rows[0]
                });

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating quiz'
            });
        }
    }

    // Get all quizzes
    static async getAllQuizzes(req, res) {
        try {
            const result = await pool.query(
                'SELECT quiz_id, admin_id, quiz_name, description, total_mark, quiz_token, is_active, created_at FROM quizzes ORDER BY created_at DESC'
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching quizzes'
            });
        }
    }

    // Get quiz by ID
    static async getQuizById(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query(
                'SELECT quiz_id, admin_id, quiz_name, description, total_mark, quiz_token, is_active, created_at FROM quizzes WHERE quiz_id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching quiz'
            });
        }
    }

    // Update quiz
    static async updateQuiz(req, res) {
        try {
            const { id } = req.params;
            const { quiz_name, description, total_mark, is_active } = req.body;

            const result = await pool.query(
                `UPDATE quizzes 
                 SET quiz_name = $1, description = $2, total_mark = $3, is_active = $4 
                 WHERE quiz_id = $5
                 RETURNING quiz_id, admin_id, quiz_name, description, total_mark, quiz_token, is_active, created_at`,
                [quiz_name, description, total_mark, is_active, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating quiz'
            });
        }
    }

    // Delete quiz
    static async deleteQuiz(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('DELETE FROM quizzes WHERE quiz_id = $1 RETURNING quiz_id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Quiz deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting quiz'
            });
        }
    }

    // Get quiz by token (for users to access quiz)
    static async getQuizByToken(req, res) {
        try {
            const { token } = req.params;

            const result = await pool.query(
                'SELECT quiz_id, admin_id, quiz_name, description, total_mark, quiz_token, is_active, created_at FROM quizzes WHERE quiz_token = $1 AND is_active = true',
                [token]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found or inactive'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching quiz'
            });
        }
    }
}

module.exports = QuizController;