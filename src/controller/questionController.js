const pool = require('../db/db');

class QuestionOptionController {
    // Create multiple questions with options in one request
    static async createQuestionsWithOptions(req, res) {
        try {
            const { quiz_id, questions } = req.body;

            if (!quiz_id || !questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz ID and questions array are required'
                });
            }

            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                const createdQuestions = [];

                for (const questionData of questions) {
                    const { question_text, points, options } = questionData;

                    if (!question_text || !options || !Array.isArray(options)) {
                        throw new Error('Each question must have question_text and options array');
                    }

                    // Insert question
                    const questionResult = await client.query(
                        `INSERT INTO questions (quiz_id, question_text, points) 
                         VALUES ($1, $2, $3) 
                         RETURNING question_id, quiz_id, question_text, points, created_at`,
                        [quiz_id, question_text, points || 1]
                    );

                    const question = questionResult.rows[0];
                    const createdOptions = [];

                    // Insert options for this question
                    for (const optionData of options) {
                        const { option_text, is_correct } = optionData;

                        if (!option_text) {
                            throw new Error('Each option must have option_text');
                        }

                        const optionResult = await client.query(
                            `INSERT INTO options (question_id, option_text, is_correct) 
                             VALUES ($1, $2, $3) 
                             RETURNING option_id, question_id, option_text, is_correct`,
                            [question.question_id, option_text, is_correct || false]
                        );

                        createdOptions.push(optionResult.rows[0]);
                    }

                    createdQuestions.push({
                        ...question,
                        options: createdOptions
                    });
                }

                await client.query('COMMIT');

                res.status(201).json({
                    success: true,
                    message: `${createdQuestions.length} questions created successfully`,
                    data: createdQuestions
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
                message: 'Error creating questions with options'
            });
        }
    }

    // Get all questions with their options
    static async getAllQuestionsWithOptions(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    q.question_id, q.quiz_id, q.question_text, q.points, q.created_at,
                    o.option_id, o.option_text, o.is_correct
                FROM questions q
                LEFT JOIN options o ON q.question_id = o.question_id
                ORDER BY q.created_at DESC, o.option_id
            `);

            const questionsMap = new Map();

            result.rows.forEach(row => {
                if (!questionsMap.has(row.question_id)) {
                    questionsMap.set(row.question_id, {
                        question_id: row.question_id,
                        quiz_id: row.quiz_id,
                        question_text: row.question_text,
                        points: row.points,
                        created_at: row.created_at,
                        options: []
                    });
                }

                if (row.option_id) {
                    questionsMap.get(row.question_id).options.push({
                        option_id: row.option_id,
                        option_text: row.option_text,
                        is_correct: row.is_correct
                    });
                }
            });

            const questions = Array.from(questionsMap.values());

            res.status(200).json({
                success: true,
                data: questions
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching questions with options'
            });
        }
    }

    // Get question with options by ID
    static async getQuestionWithOptionsById(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query(`
                SELECT 
                    q.question_id, q.quiz_id, q.question_text, q.points, q.created_at,
                    o.option_id, o.option_text, o.is_correct
                FROM questions q
                LEFT JOIN options o ON q.question_id = o.question_id
                WHERE q.question_id = $1
                ORDER BY o.option_id
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            const question = {
                question_id: result.rows[0].question_id,
                quiz_id: result.rows[0].quiz_id,
                question_text: result.rows[0].question_text,
                points: result.rows[0].points,
                created_at: result.rows[0].created_at,
                options: []
            };

            result.rows.forEach(row => {
                if (row.option_id) {
                    question.options.push({
                        option_id: row.option_id,
                        option_text: row.option_text,
                        is_correct: row.is_correct
                    });
                }
            });

            res.status(200).json({
                success: true,
                data: question
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching question with options'
            });
        }
    }

    // Update question with options
    static async updateQuestionWithOptions(req, res) {
        try {
            const { id } = req.params;
            const { question_text, points, options } = req.body;

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // Update question
                const questionResult = await client.query(
                    `UPDATE questions 
                     SET question_text = $1, points = $2 
                     WHERE question_id = $3
                     RETURNING question_id, quiz_id, question_text, points, created_at`,
                    [question_text, points, id]
                );

                if (questionResult.rows.length === 0) {
                    throw new Error('Question not found');
                }

                const question = questionResult.rows[0];

                // Delete existing options
                await client.query('DELETE FROM options WHERE question_id = $1', [id]);

                const createdOptions = [];

                // Insert new options
                if (options && Array.isArray(options)) {
                    for (const optionData of options) {
                        const { option_text, is_correct } = optionData;

                        if (!option_text) {
                            throw new Error('Each option must have option_text');
                        }

                        const optionResult = await client.query(
                            `INSERT INTO options (question_id, option_text, is_correct) 
                             VALUES ($1, $2, $3) 
                             RETURNING option_id, question_id, option_text, is_correct`,
                            [id, option_text, is_correct || false]
                        );

                        createdOptions.push(optionResult.rows[0]);
                    }
                }

                await client.query('COMMIT');

                res.status(200).json({
                    success: true,
                    data: {
                        ...question,
                        options: createdOptions
                    }
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
                message: 'Error updating question with options'
            });
        }
    }

    // Delete question (options will be deleted automatically due to CASCADE)
    static async deleteQuestion(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('DELETE FROM questions WHERE question_id = $1 RETURNING question_id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Question and its options deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting question'
            });
        }
    }
}

module.exports = QuestionOptionController;