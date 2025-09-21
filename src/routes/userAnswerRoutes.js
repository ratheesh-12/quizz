const express = require('express');
const router = express.Router();
const UserAnswerController = require('../controller/userAnswerController');

// POST http://localhost:3000/api/user-answers - Submit user answers for a quiz
router.post('/', UserAnswerController.submitUserAnswers);

// GET http://localhost:3000/api/user-answers - Get all user answers
router.get('/', UserAnswerController.getAllUserAnswers);

// GET http://localhost:3000/api/user-answers/:user_id/:quiz_id - Get user answers for specific quiz
router.get('/:user_id/:quiz_id', UserAnswerController.getUserAnswersByQuiz);

// GET http://localhost:3000/api/user-answers/:user_id/:quiz_id/:question_id - Get user answer for specific question
router.get('/:user_id/:quiz_id/:question_id', UserAnswerController.getUserAnswerByQuestion);

// PUT http://localhost:3000/api/user-answers/:user_id/:quiz_id/:question_id - Update user answer for specific question
router.put('/:user_id/:quiz_id/:question_id', UserAnswerController.updateUserAnswer);

// DELETE http://localhost:3000/api/user-answers/:user_id/:quiz_id - Delete all user answers for a quiz
router.delete('/:user_id/:quiz_id', UserAnswerController.deleteUserAnswersForQuiz);

module.exports = router;