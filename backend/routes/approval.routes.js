const express = require('express');
const { check } = require('express-validator');
const approvalController = require('../controllers/approval.controller');
const { requireAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

const router = express.Router();

router.use(requireAuth);

router.get('/pending', allowRoles('admin', 'manager'), approvalController.getPendingApprovals);

router.post(
  '/:expenseId/action',
  allowRoles('admin', 'manager'),
  [
    check('decision', 'Decision must be approved or rejected').isIn(['approved', 'rejected']),
    check('comment', 'Comment must be a string').optional().isString(),
  ],
  approvalController.actionApproval
);

// Admin/manager can securely query their specific timelines 
// To make it simple, we leave getTimeline open to all authenticated users; 
// however, the controller scope-locks it purely to company_id bounds securely.
router.get('/:expenseId/timeline', approvalController.getTimeline);

module.exports = router;
