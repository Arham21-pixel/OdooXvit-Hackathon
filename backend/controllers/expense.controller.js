const { validationResult } = require('express-validator');
const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const currencyService = require('../services/currency.service');

const CATEGORIES = ['Travel', 'Meals', 'Accommodation', 'Office Supplies', 'Medical', 'Other'];

exports.submitExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { amount, currency, category, description, date, receipt_url } = req.body;
  const company_id = req.user.company_id;
  const employee_id = req.user.id;

  if (!CATEGORIES.includes(category)) {
    return sendError(res, 'Invalid category', 400);
  }

  try {
    // 1. Look up company's default currency
    const companyQuery = 'SELECT currency_code FROM companies WHERE id = $1';
    const { rows: companyRows } = await db.query(companyQuery, [company_id]);
    if (companyRows.length === 0) {
      return sendError(res, 'Company not found', 404);
    }
    const company_currency = companyRows[0].currency_code || 'USD';

    // 2. Convert amount to company currency
    let converted_amount;
    try {
      converted_amount = await currencyService.convertAmount(amount, currency, company_currency);
    } catch (err) {
      return sendError(res, 'Error calculating currency conversion', 500);
    }

    await db.query('BEGIN');

    // 3. Save expense with status 'pending'
    const expenseQuery = `
      INSERT INTO expenses 
      (employee_id, amount, currency, converted_amount, company_currency, category, description, date, receipt_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `;
    const expenseValues = [
      employee_id, amount, currency, converted_amount, company_currency, category, description, date, receipt_url || null
    ];
    const { rows: expenseRows } = await db.query(expenseQuery, expenseValues);
    const expense = expenseRows[0];

    // 4. Trigger approval flow: find first approval_step for company
    const firstStepQuery = `
      SELECT id, approver_id 
      FROM approval_steps 
      WHERE company_id = $1 
      ORDER BY step_order ASC 
      LIMIT 1
    `;
    const { rows: stepRows } = await db.query(firstStepQuery, [company_id]);

    if (stepRows.length > 0) {
      const step = stepRows[0];
      // create expense_approvals row for step 1
      const approvalQuery = `
        INSERT INTO expense_approvals (expense_id, step_id, approver_id, status)
        VALUES ($1, $2, $3, 'pending')
      `;
      await db.query(approvalQuery, [expense.id, step.id, step.approver_id || null]);
    }

    await db.query('COMMIT');
    return sendSuccess(res, expense, 201);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('submitExpense Error:', err);
    return sendError(res, 'Server error submitting expense', 500);
  }
};

exports.getExpenses = async (req, res) => {
  const { id: userId, role, company_id } = req.user;

  try {
    let query = `
      SELECT e.*, u.name as employee_name
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE u.company_id = $1
    `;
    const values = [company_id];

    if (role === 'employee') {
      query += ` AND e.employee_id = $2`;
      values.push(userId);
    } else if (role === 'manager') {
      query += ` AND (e.employee_id = $2 OR u.manager_id = $2)`;
      values.push(userId);
    }
    // if admin, see all in company (no extra condition needed)

    query += ` ORDER BY e.created_at DESC`;

    const { rows } = await db.query(query, values);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error('getExpenses Error:', err);
    return sendError(res, 'Server error fetching expenses', 500);
  }
};

exports.getExpense = async (req, res) => {
  const { id: expenseId } = req.params;
  const { company_id, role, id: userId } = req.user;

  try {
    const query = `
      SELECT e.*, u.name as employee_name, u.manager_id
      FROM expenses e
      JOIN users u ON e.employee_id = u.id
      WHERE e.id = $1 AND u.company_id = $2
    `;
    const { rows } = await db.query(query, [expenseId, company_id]);

    if (rows.length === 0) {
      return sendError(res, 'Expense not found or unauthorized', 404);
    }

    const expense = rows[0];

    // Authorization checks based on role
    if (role === 'employee' && expense.employee_id !== userId) {
      return sendError(res, 'Not authorized to view this expense', 403);
    }
    if (role === 'manager' && expense.employee_id !== userId && expense.manager_id !== userId) {
       return sendError(res, 'Not authorized to view this expense', 403);
    }

    // Approval Timeline
    const timelineQuery = `
      SELECT a.id, a.status, a.comment, a.actioned_at, 
             s.step_order, s.role_label,
             u.name as approver_name
      FROM expense_approvals a
      LEFT JOIN approval_steps s ON a.step_id = s.id
      LEFT JOIN users u ON a.approver_id = u.id
      WHERE a.expense_id = $1
      ORDER BY s.step_order ASC, a.id ASC
    `;
    const { rows: timelineRows } = await db.query(timelineQuery, [expenseId]);
    
    return sendSuccess(res, {
      ...expense,
      timeline: timelineRows
    });
  } catch (err) {
    console.error('getExpense Error:', err);
    return sendError(res, 'Server error fetching expense details', 500);
  }
};
