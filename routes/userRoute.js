const express = require('express');
const userController = require('../controllers/userController');
const expenseController = require('../controllers/expenseController');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/signin',userController.signin, expenseController.getAllExpenses);
router.get('/reports', userAuthentication.authenticate, userController.getReport);
router.get('/download', userAuthentication.authenticate, expenseController.downloadExpense);


module.exports = router;
