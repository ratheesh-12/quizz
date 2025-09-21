const express = require('express');
const router = express.Router();
const QuestionOptionController = require('../controller/questionController');

// POST http://localhost:3000/api/questions - Create multiple questions with options
router.post('/', QuestionOptionController.createQuestionsWithOptions);

// GET http://localhost:3000/api/questions - Get all questions with their options
router.get('/', QuestionOptionController.getAllQuestionsWithOptions);

// GET http://localhost:3000/api/questions/:id - Get question with options by ID (e.g., /api/questions/1)
router.get('/:id', QuestionOptionController.getQuestionWithOptionsById);

// PUT http://localhost:3000/api/questions/:id - Update question with options (e.g., /api/questions/1)
router.put('/:id', QuestionOptionController.updateQuestionWithOptions);

// DELETE http://localhost:3000/api/questions/:id - Delete question and its options (e.g., /api/questions/1)
router.delete('/:id', QuestionOptionController.deleteQuestion);

module.exports = router;