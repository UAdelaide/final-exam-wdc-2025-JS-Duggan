const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  // change to session.user_id to match current session
  if (!req.session.user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user_id);
});

// Post login (modified)
router.post('/login', async (req, res) => {
  // user username instead of email
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // re-route user to dashboard page and save info to session
    req.session.user_id = rows[0].user_id;
    req.session.username = rows[0].username;
    req.session.role = rows[0].role;
    res.redirect(`/${rows[0].role}-dashboard.html`);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Add logout functionality
router.post('/logout', (req, res) => {
  // clear session
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send(err + 'Failed to logout');
    }
    // clear session cookie
    res.clearCookie('connect.sid');
    // redirect user to login page
    res.redirect('/');
  });
});

module.exports = router;
