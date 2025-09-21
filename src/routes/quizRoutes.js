const express = require('express');
const router = express.Router();
const QuizController = require('../controller/quizController');

// POST http://localhost:3000/api/quizzes - Create a new quiz
router.post('/', QuizController.createQuiz);

// GET http://localhost:3000/api/quizzes - Get all quizzes
router.get('/', QuizController.getAllQuizzes);

// GET http://localhost:3000/api/quizzes/token/:token - Get quiz by token (e.g., /api/quizzes/token/A5B2C)
router.get('/token/:token', QuizController.getQuizByToken);

// GET http://localhost:3000/api/quizzes/:id - Get quiz by ID (e.g., /api/quizzes/1)
router.get('/:id', QuizController.getQuizById);

// PUT http://localhost:3000/api/quizzes/:id - Update quiz (e.g., /api/quizzes/1)
router.put('/:id', QuizController.updateQuiz);

// DELETE http://localhost:3000/api/quizzes/:id - Delete quiz (e.g., /api/quizzes/1)
router.delete('/:id', QuizController.deleteQuiz);

module.exports = router;