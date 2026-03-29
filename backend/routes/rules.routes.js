const express = require('express');
const { check } = require('express-validator');
const rulesController = require('../controllers/rules.controller');
const { requireAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

const router = express.Router();

router.use(requireAuth, allowRoles('admin'));

router.get('/', rulesController.getRules);

router.post(
  '/steps',
  [
    check('steps', 'Steps must be an array').isArray()
  ],
  rulesController.saveSteps
);

router.post(
  '/condition',
  [
    check('rule_type', 'Invalid rule type').isIn(['percentage', 'specific', 'hybrid'])
  ],
  rulesController.saveCondition
);

module.exports = router;
