var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');


router.get('/dogs', async function(req, res, next) {
  try {
    const connection = await mysql.createConnection({
      socketPath: '/var/run/mysqld/mysqld.sock',
      database
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();


  } catch (error) {
    res.status(400).send();
  }
});

router.get('/walkrequests/open', function(req, res, next) {
  try {
    let results;
    res.status(200).send(results);
  } catch (error) {
    res.status(400).send();
  }
});

router.get('/walkers/summary', function(req, res, next) {
  try {
    let results;
    res.status(200).send(results);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;