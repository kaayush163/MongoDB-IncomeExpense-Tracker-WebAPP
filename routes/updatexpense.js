const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense');
const userauthentication = require('../middleware/auth');


router.get('/get-update-totalbalance', userauthentication.authenticate ,expenseController.getUpdateExpense);

module.exports = router;