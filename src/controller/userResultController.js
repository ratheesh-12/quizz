const pool = require('../db/db');

class UserResultController {
    // Calculate and save quiz result
    static async calculateAndSaveResult(req, res) {
        try {
            const { user_id, quiz_id } = req.body;

            if (!user_id || !quiz_id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and quiz ID are required'
                });
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // Calculate score based on user answers
                const scoreResult = await client.query(`
                    SELECT 
                        COALESCE(SUM(CASE WHEN o.is_correct = true THEN q.points ELSE 0 END), 0) as score
                    FROM user_answers ua
                    JOIN options o ON ua.option_id = o.option_id
                    JOIN questions q ON ua.question_id = q.question_id
                    WHERE ua.user_id = $1 AND ua.quiz_id = $2
                `, [user_id, quiz_id]);

                const score = scoreResult.rows[0].score;

                // Insert or update result (using ON CONFLICT for the unique constraint)
                const result = await client.query(`
                    INSERT INTO user_results (user_id, quiz_id, score, completed_at) 
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, quiz_id) 
                    DO UPDATE SET score = $3, completed_at = CURRENT_TIMESTAMP
                    RETURNING result_id, user_id, quiz_id, score, completed_at
                `, [user_id, quiz_id, score]);

                await client.query('COMMIT');

                res.status(201).json({
                    success: true,
                    message: 'Quiz result calculated and saved successfully',
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
                message: 'Error calculating quiz result'
            });
        }
    }

    // Create result manually (for admin purposes)
    static async createResult(req, res) {
        try {
            const { user_id, quiz_id, score } = req.body;

            if (!user_id || !quiz_id || score === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, quiz ID, and score are required'
                });
            }

            const result = await pool.query(
                `INSERT INTO user_results (user_id, quiz_id, score) 
                 VALUES ($1, $2, $3) 
                 RETURNING result_id, user_id, quiz_id, score, completed_at`,
                [user_id, quiz_id, score]
            );

            res.status(201).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating result'
            });
        }
    }

    // Get all results
    static async getAllResults(req, res) {
        try {
            const result = await pool.query(
                'SELECT result_id, user_id, quiz_id, score, completed_at FROM user_results ORDER BY completed_at DESC'
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching results'
            });
        }
    }

    // Get result by ID
    static async getResultById(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query(
                'SELECT result_id, user_id, quiz_id, score, completed_at FROM user_results WHERE result_id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching result'
            });
        }
    }

    // Get results by user
    static async getResultsByUser(req, res) {
        try {
            const { user_id } = req.params;

            const result = await pool.query(
                'SELECT result_id, user_id, quiz_id, score, completed_at FROM user_results WHERE user_id = $1 ORDER BY completed_at DESC',
                [user_id]
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user results'
            });
        }
    }

    // Get results by quiz
    static async getResultsByQuiz(req, res) {
        try {
            const { quiz_id } = req.params;

            const result = await pool.query(
                'SELECT result_id, user_id, quiz_id, score, completed_at FROM user_results WHERE quiz_id = $1 ORDER BY score DESC, completed_at',
                [quiz_id]
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching quiz results'
            });
        }
    }

    // Get specific user result for a quiz
    static async getUserQuizResult(req, res) {
        try {
            const { user_id, quiz_id } = req.params;

            const result = await pool.query(
                'SELECT result_id, user_id, quiz_id, score, completed_at FROM user_results WHERE user_id = $1 AND quiz_id = $2',
                [user_id, quiz_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found for this user and quiz'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user quiz result'
            });
        }
    }

    // Update result score
    static async updateResult(req, res) {
        try {
            const { id } = req.params;
            const { score } = req.body;

            if (score === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Score is required'
                });
            }

            const result = await pool.query(
                `UPDATE user_results 
                 SET score = $1, completed_at = CURRENT_TIMESTAMP 
                 WHERE result_id = $2
                 RETURNING result_id, user_id, quiz_id, score, completed_at`,
                [score, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating result'
            });
        }
    }

    // Delete result
    static async deleteResult(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('DELETE FROM user_results WHERE result_id = $1 RETURNING result_id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Result not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Result deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting result'
            });
        }
    }
}

module.exports = UserResultController;