const express = require('express');
const router = express.Router();
const db = require('../models/db');

// return dog_id and name for walk requests
router.get('/dogs', async function(req, res, next) {
  const owner_id = req.session.user_id;
  try {
    const [dogs] = await db.execute(`
      SELECT
        dog_id,
        name
      FROM
        Dogs
      WHERE
        owner_id = ?;
      `, [owner_id]);
    res.status(200).json(dogs);
  } catch (error) {
    res.status(400).send('Error: ' + error);
  }
});

module.exports = router;