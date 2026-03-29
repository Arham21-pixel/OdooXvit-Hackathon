const db = require('../config/db');

exports.processApproval = async (expenseId, approverId, decision, comment) => {
  try {
    // 1. Find current pending expense_approval
    const pendingQuery = `
      SELECT a.id, a.step_id, s.step_order, e.company_id, e.status as expense_status
      FROM expense_approvals a
      JOIN expenses e ON a.expense_id = e.id
      LEFT JOIN approval_steps s ON a.step_id = s.id
      WHERE a.expense_id = $1 AND a.status = 'pending'
      ORDER BY a.id ASC LIMIT 1
    `;
    const { rows: pendingRows } = await db.query(pendingQuery, [expenseId]);
    if (pendingRows.length === 0) {
      throw new Error('No pending approval found for this expense.');
    }

    const currentApproval = pendingRows[0];
    const { company_id, step_order } = currentApproval;

    // 2. Update it with decision + comment
    const updateApproval = `
      UPDATE expense_approvals
      SET status = $1, comment = $2, actioned_at = CURRENT_TIMESTAMP, approver_id = $3
      WHERE id = $4
    `;
    await db.query(updateApproval, [decision, comment || null, approverId, currentApproval.id]);

    // 5. If decision=rejected
    if (decision === 'rejected') {
      await db.query(`UPDATE expenses SET status = 'rejected' WHERE id = $1`, [expenseId]);
      return;
    }

    // decision=approved => Evaluate logic
    // 3. Check approval_rules
    const rulesQuery = `SELECT * FROM approval_rules WHERE company_id = $1`;
    const { rows: rules } = await db.query(rulesQuery, [company_id]);

    let triggeredEarly = false;
    for (let rule of rules) {
      if (rule.rule_type === 'specific' || rule.rule_type === 'hybrid') {
        if (rule.specific_approver_id === approverId) {
          triggeredEarly = true;
          break;
        }
      }
      if (rule.rule_type === 'percentage' || rule.rule_type === 'hybrid') {
        const { rows: tRows } = await db.query(`SELECT COUNT(*) as c FROM approval_steps WHERE company_id = $1`, [company_id]);
        const totalSteps = parseInt(tRows[0].c);

        const { rows: aRows } = await db.query(`SELECT COUNT(*) as c FROM expense_approvals WHERE expense_id = $1 AND status = 'approved'`, [expenseId]);
        const approvedCount = parseInt(aRows[0].c);

        if (totalSteps > 0 && ((approvedCount / totalSteps) * 100) >= parseFloat(rule.percentage_threshold)) {
          triggeredEarly = true;
          break;
        }
      }
    }

    if (triggeredEarly) {
      await db.query(`UPDATE expenses SET status = 'approved' WHERE id = $1`, [expenseId]);
      return;
    }

    // 4. Find next step
    const nextStepQuery = `
      SELECT id, approver_id 
      FROM approval_steps 
      WHERE company_id = $1 AND step_order > $2
      ORDER BY step_order ASC LIMIT 1
    `;
    const { rows: nextSteps } = await db.query(nextStepQuery, [company_id, step_order || 0]);

    if (nextSteps.length > 0) {
      // create next row
      const nextStep = nextSteps[0];
      await db.query(`
        INSERT INTO expense_approvals (expense_id, step_id, approver_id, status)
        VALUES ($1, $2, $3, 'pending')
      `, [expenseId, nextStep.id, nextStep.approver_id || null]);
    } else {
      // 6. All steps approved
      await db.query(`UPDATE expenses SET status = 'approved' WHERE id = $1`, [expenseId]);
    }

  } catch (err) {
    console.error('Approval Engine Error:', err);
    throw err;
  }
};
