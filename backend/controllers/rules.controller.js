const { validationResult } = require('express-validator');
const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getRules = async (req, res) => {
  const companyId = req.user.company_id;

  try {
    const stepsQuery = `
      SELECT id, step_order, approver_id, role_label 
      FROM approval_steps 
      WHERE company_id = $1 
      ORDER BY step_order ASC
    `;
    const { rows: steps } = await db.query(stepsQuery, [companyId]);

    const rulesQuery = `
      SELECT id, rule_type, percentage_threshold, specific_approver_id 
      FROM approval_rules 
      WHERE company_id = $1
    `;
    const { rows: rules } = await db.query(rulesQuery, [companyId]);

    return sendSuccess(res, { steps, rules });
  } catch (err) {
    console.error('getRules error:', err);
    return sendError(res, 'Server error fetching rules', 500);
  }
};

exports.saveSteps = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { steps } = req.body;
  const companyId = req.user.company_id;

  try {
    await db.query('BEGIN');

    // Delete existing
    await db.query('DELETE FROM approval_steps WHERE company_id = $1', [companyId]);

    // Insert new ones
    if (steps && steps.length > 0) {
      for (let step of steps) {
        await db.query(`
          INSERT INTO approval_steps (company_id, step_order, approver_id, role_label)
          VALUES ($1, $2, $3, $4)
        `, [companyId, step.step_order, step.approver_id || null, step.role_label]);
      }
    }

    await db.query('COMMIT');

    return sendSuccess(res, { message: 'Approval steps updated successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('saveSteps error:', err);
    return sendError(res, 'Server error saving steps', 500);
  }
};

exports.saveCondition = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { rule_type, percentage_threshold, specific_approver_id } = req.body;
  const companyId = req.user.company_id;

  try {
    await db.query('BEGIN');

    // We only support one rule set right now per company
    await db.query('DELETE FROM approval_rules WHERE company_id = $1', [companyId]);

    await db.query(`
      INSERT INTO approval_rules (company_id, rule_type, percentage_threshold, specific_approver_id)
      VALUES ($1, $2, $3, $4)
    `, [companyId, rule_type, percentage_threshold || null, specific_approver_id || null]);

    await db.query('COMMIT');

    return sendSuccess(res, { message: 'Conditional rule saved successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('saveCondition error:', err);
    return sendError(res, 'Server error saving condition', 500);
  }
};
