const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense');
const userauthentication = require('../middleware/auth');

router.get('/get-expense', userauthentication.authenticate ,expenseController.getExpense);   

router.post('/add-expense', userauthentication.authenticate, expenseController.postExpense);

router.delete('/delete-expense/:id', userauthentication.authenticate, expenseController.deleteExpense);

router.put('/edit-expense/:id',userauthentication.authenticate, expenseController.editExpense);

module.exports = router;
