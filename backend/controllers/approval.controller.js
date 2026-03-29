const { validationResult } = require('express-validator');
const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const approvalEngine = require('../services/approval.engine');

exports.getPendingApprovals = async (req, res) => {
  try {
    const query = `
      SELECT e.*, a.id as approval_id, a.step_id, s.role_label, emp.name as employee_name
      FROM expense_approvals a
      JOIN expenses e ON a.expense_id = e.id
      LEFT JOIN approval_steps s ON a.step_id = s.id
      JOIN users emp ON e.employee_id = emp.id
      WHERE a.status = 'pending'
        AND e.status = 'pending'
        AND emp.company_id = $1
        AND (a.approver_id = $2 OR (a.approver_id IS NULL AND emp.manager_id = $2) OR $3 = 'admin')
      ORDER BY a.actioned_at ASC, e.created_at ASC
    `;
    const { rows } = await db.query(query, [req.user.company_id, req.user.id, req.user.role]);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error('getPendingApprovals error:', err);
    return sendError(res, 'Server error fetching pending approvals', 500);
  }
};

exports.actionApproval = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { expenseId } = req.params;
  const { decision, comment } = req.body;
  const approverId = req.user.id;
  const companyId = req.user.company_id;

  try {
    // Validate user is authorized to action this
    const checkQuery = `
      SELECT a.id, a.approver_id, e.employee_id, emp.manager_id
      FROM expense_approvals a
      JOIN expenses e ON a.expense_id = e.id
      JOIN users emp ON e.employee_id = emp.id
      WHERE a.expense_id = $1 AND a.status = 'pending' AND emp.company_id = $2
    `;
    const { rows: checks } = await db.query(checkQuery, [expenseId, companyId]);

    if (checks.length === 0) {
      return sendError(res, 'No pending approval found for this expense', 404);
    }

    const approval = checks[0];
    const isAuthorized = approval.approver_id === approverId || 
                         (approval.approver_id === null && approval.manager_id === approverId) ||
                         req.user.role === 'admin';

    if (!isAuthorized) {
      return sendError(res, 'You are not authorized to approve this step', 403);
    }

    await approvalEngine.processApproval(expenseId, approverId, decision, comment);

    return sendSuccess(res, { message: 'Expense ' + decision + ' successfully' });
  } catch (err) {
    console.error('actionApproval error:', err);
    return sendError(res, err.message || 'Server error processing approval', 500);
  }
};

exports.getTimeline = async (req, res) => {
  const { expenseId } = req.params;
  const companyId = req.user.company_id;

  try {
    const expCheck = await db.query('SELECT e.id FROM expenses e JOIN users u ON e.employee_id = u.id WHERE e.id = $1 AND u.company_id = $2', [expenseId, companyId]);
    if (expCheck.rows.length === 0) {
      return sendError(res, 'Expense not found in your company', 404);
    }

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
    const { rows } = await db.query(timelineQuery, [expenseId]);
    
    return sendSuccess(res, rows);
  } catch (err) {
    console.error('getTimeline error:', err);
    return sendError(res, 'Server error fetching timeline', 500);
  }
};
