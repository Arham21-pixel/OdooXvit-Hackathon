const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const { validationResult } = require('express-validator');

exports.getUsers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role, manager_id, is_manager_approver, created_at
      FROM users
      WHERE company_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [req.user.company_id]);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error('getUsers error:', err);
    return sendError(res, 'Server error fetching users', 500);
  }
};

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { name, email, password, role, manager_id, is_manager_approver } = req.body;
  const company_id = req.user.company_id;

  try {
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return sendError(res, 'User email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (company_id, name, email, password_hash, role, manager_id, is_manager_approver)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, manager_id, is_manager_approver, created_at
    `;
    const values = [
      company_id,
      name,
      email,
      passwordHash,
      role || 'employee',
      manager_id || null,
      is_manager_approver || false
    ];

    const { rows } = await db.query(query, values);
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    console.error('createUser error:', err);
    return sendError(res, 'Server error creating user', 500);
  }
};

exports.changeRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'manager', 'employee'].includes(role)) {
    return sendError(res, 'Invalid role specified', 400);
  }

  try {
    const query = `
      UPDATE users 
      SET role = $1
      WHERE id = $2 AND company_id = $3 AND deleted_at IS NULL
      RETURNING id, name, email, role
    `;
    const { rows } = await db.query(query, [role, id, req.user.company_id]);

    if (rows.length === 0) {
      return sendError(res, 'User not found or not in your company', 404);
    }

    return sendSuccess(res, rows[0]);
  } catch (err) {
    console.error('changeRole error:', err);
    return sendError(res, 'Server error updating role', 500);
  }
};

exports.changeManager = async (req, res) => {
  const { id } = req.params;
  const { manager_id } = req.body;

  try {
    if (parseInt(id) === parseInt(manager_id)) {
      return sendError(res, 'User cannot be their own manager', 400);
    }

    if (manager_id) {
       const managerCheck = await db.query('SELECT id FROM users WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL', [manager_id, req.user.company_id]);
       if (managerCheck.rows.length === 0) {
          return sendError(res, 'Specified manager not found in your company', 404);
       }
    }

    const query = `
      UPDATE users 
      SET manager_id = $1
      WHERE id = $2 AND company_id = $3 AND deleted_at IS NULL
      RETURNING id, name, manager_id
    `;
    const { rows } = await db.query(query, [manager_id || null, id, req.user.company_id]);

    if (rows.length === 0) {
      return sendError(res, 'User not found or not in your company', 404);
    }

    return sendSuccess(res, rows[0]);
  } catch (err) {
    console.error('changeManager error:', err);
    return sendError(res, 'Server error updating manager', 500);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Soft delete
    const query = `
      UPDATE users
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    const { rows } = await db.query(query, [id, req.user.company_id]);

    if (rows.length === 0) {
      return sendError(res, 'User not found, already deleted, or not in your company', 404);
    }

    return sendSuccess(res, { message: 'User successfully deactivated' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return sendError(res, 'Server error deleting user', 500);
  }
};
