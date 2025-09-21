const pool = require('../db/db');

class UserAnswerController {
    // Submit user answers for a quiz (multiple answers at once)
    static async submitUserAnswers(req, res) {
        try {
            const { user_id, quiz_id, answers } = req.body;

            if (!user_id || !quiz_id || !answers || !Array.isArray(answers) || answers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, quiz ID, and answers array are required'
                });
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                const submittedAnswers = [];

                for (const answer of answers) {
                    const { question_id, option_id } = answer;

                    if (!question_id || !option_id) {
                        throw new Error('Each answer must have question_id and option_id');
                    }

                    // Insert or update user answer (using ON CONFLICT for the composite primary key)
                    const result = await client.query(
                        `INSERT INTO user_answers (user_id, quiz_id, question_id, option_id, answered_at) 
                         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                         ON CONFLICT (user_id, quiz_id, question_id) 
                         DO UPDATE SET option_id = $4, answered_at = CURRENT_TIMESTAMP
                         RETURNING user_id, quiz_id, question_id, option_id, answered_at`,
                        [user_id, quiz_id, question_id, option_id]
                    );

                    submittedAnswers.push(result.rows[0]);
                }

                await client.query('COMMIT');

                res.status(201).json({
                    success: true,
                    message: `${submittedAnswers.length} answers submitted successfully`,
                    data: submittedAnswers
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
                message: 'Error submitting user answers'
            });
        }
    }

    // Get all user answers
    static async getAllUserAnswers(req, res) {
        try {
            const result = await pool.query(
                'SELECT user_id, quiz_id, question_id, option_id, answered_at FROM user_answers ORDER BY answered_at DESC'
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user answers'
            });
        }
    }

    // Get user answers for a specific quiz
    static async getUserAnswersByQuiz(req, res) {
        try {
            const { user_id, quiz_id } = req.params;

            const result = await pool.query(
                'SELECT user_id, quiz_id, question_id, option_id, answered_at FROM user_answers WHERE user_id = $1 AND quiz_id = $2 ORDER BY question_id',
                [user_id, quiz_id]
            );

            res.status(200).json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user answers for quiz'
            });
        }
    }

    // Get user answers for a specific question
    static async getUserAnswerByQuestion(req, res) {
        try {
            const { user_id, quiz_id, question_id } = req.params;

            const result = await pool.query(
                'SELECT user_id, quiz_id, question_id, option_id, answered_at FROM user_answers WHERE user_id = $1 AND quiz_id = $2 AND question_id = $3',
                [user_id, quiz_id, question_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User answer not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user answer'
            });
        }
    }

    // Update a specific user answer
    static async updateUserAnswer(req, res) {
        try {
            const { user_id, quiz_id, question_id } = req.params;
            const { option_id } = req.body;

            if (!option_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Option ID is required'
                });
            }

            const result = await pool.query(
                `UPDATE user_answers 
                 SET option_id = $1, answered_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $2 AND quiz_id = $3 AND question_id = $4
                 RETURNING user_id, quiz_id, question_id, option_id, answered_at`,
                [option_id, user_id, quiz_id, question_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User answer not found'
                });
            }

            res.status(200).json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating user answer'
            });
        }
    }

    // Delete user answers for a quiz (if user wants to restart)
    static async deleteUserAnswersForQuiz(req, res) {
        try {
            const { user_id, quiz_id } = req.params;

            const result = await pool.query(
                'DELETE FROM user_answers WHERE user_id = $1 AND quiz_id = $2 RETURNING user_id, quiz_id',
                [user_id, quiz_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No user answers found for this quiz'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User answers deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting user answers'
            });
        }
    }
}

module.exports = UserAnswerController;