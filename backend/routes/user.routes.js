const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

const router = express.Router();

// All routes require auth and admin role
router.use(requireAuth, allowRoles('admin'));

// GET /api/users
router.get('/', userController.getUsers);

// POST /api/users
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').optional().isIn(['admin', 'manager', 'employee']),
  ],
  userController.createUser
);

// PATCH /api/users/:id/role
router.patch('/:id/role', userController.changeRole);

// PATCH /api/users/:id/manager
router.patch('/:id/manager', userController.changeManager);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;
