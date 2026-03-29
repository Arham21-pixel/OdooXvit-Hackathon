const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const { signToken } = require('../utils/jwt');
const axios = require('axios');

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { name, email, password, country } = req.body;

  try {
    // 1. Check if user already exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return sendError(res, 'User already exists', 400);
    }

    // 2. Fetch country currency
    let currency_code = 'USD'; // default
    try {
      const resp = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries = resp.data;
      
      const foundCountry = countries.find(
        (c) => c.name.common.toLowerCase() === country.toLowerCase() || 
               (c.name.official && c.name.official.toLowerCase() === country.toLowerCase())
      );

      if (foundCountry && foundCountry.currencies) {
        currency_code = Object.keys(foundCountry.currencies)[0];
      }
    } catch (err) {
      console.error('Error fetching country data:', err.message);
      // fallback to USD
    }

    // 3. Create Company
    const companyQuery = `
      INSERT INTO companies (name, country, currency_code)
      VALUES ($1, $2, $3)
      RETURNING id, name, currency_code
    `;
    const companyResult = await db.query(companyQuery, [`${name}'s Company`, country, currency_code]);
    const company = companyResult.rows[0];

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Create User as admin
    const userQuery = `
      INSERT INTO users (company_id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, company_id
    `;
    const userResult = await db.query(userQuery, [company.id, name, email, passwordHash, 'admin']);
    const user = userResult.rows[0];

    // 6. Sign JWT
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };
    const token = signToken(payload);

    return sendSuccess(res, { token, user, company }, 201);
  } catch (err) {
    console.error('Signup Error:', err);
    return sendError(res, 'Server error during signup', 500);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 400);
  }

  const { email, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };
    const token = signToken(payload);

    return sendSuccess(res, { 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      } 
    });
  } catch (err) {
    console.error('Login Error:', err);
    return sendError(res, 'Server error during login', 500);
  }
};
