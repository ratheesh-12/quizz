const express = require('express');
const router = express.Router();
const UserResultController = require('../controller/userResultController');

// POST http://localhost:3000/api/results/calculate - Calculate and save quiz result automatically
router.post('/calculate', UserResultController.calculateAndSaveResult);

// POST http://localhost:3000/api/results - Create result manually (admin)
router.post('/', UserResultController.createResult);

// GET http://localhost:3000/api/results - Get all results
router.get('/', UserResultController.getAllResults);

// GET http://localhost:3000/api/results/:id - Get result by ID
router.get('/:id', UserResultController.getResultById);

// GET http://localhost:3000/api/results/user/:user_id - Get all results for a user
router.get('/user/:user_id', UserResultController.getResultsByUser);

// GET http://localhost:3000/api/results/quiz/:quiz_id - Get all results for a quiz (leaderboard)
router.get('/quiz/:quiz_id', UserResultController.getResultsByQuiz);

// GET http://localhost:3000/api/results/user/:user_id/quiz/:quiz_id - Get specific user result for a quiz
router.get('/user/:user_id/quiz/:quiz_id', UserResultController.getUserQuizResult);

// PUT http://localhost:3000/api/results/:id - Update result score
router.put('/:id', UserResultController.updateResult);

// DELETE http://localhost:3000/api/results/:id - Delete result
router.delete('/:id', UserResultController.deleteResult);

module.exports = router;