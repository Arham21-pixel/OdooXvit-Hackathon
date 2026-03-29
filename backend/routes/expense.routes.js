const express = require('express');
const { check } = require('express-validator');
const expenseController = require('../controllers/expense.controller');
const { requireAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

const router = express.Router();

router.use(requireAuth);

router.post(
  '/',
  allowRoles('employee'),
  [
    check('amount', 'Amount must be a numeric value').isNumeric(),
    check('currency', 'Currency code (e.g. USD) is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('date', 'Date must be valid').isISO8601(),
  ],
  expenseController.submitExpense
);

router.get('/', expenseController.getExpenses);

router.get('/:id', expenseController.getExpense);

module.exports = router;
