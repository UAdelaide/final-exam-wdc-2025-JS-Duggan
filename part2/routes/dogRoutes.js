const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/dogs', async function(req, res, next) {
  try {
    const [dogs] = await db.execute(`
      SELECT
        id
        name,
        (SELECT username FROM Users WHERE user_id = owner_id) as owner_username
      FROM
        Dogs;
      WHERE
        owner_id = ?
      `);
    res.status(200).json(dogs);
  } catch (error) {
    res.status(400).send('Error: ' + error);
  }
});

module.exports = router;