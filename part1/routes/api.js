var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');

(async () => {
  try {
      const connection = await mysql.createConnection({
        socketPath: '/var/run/mysqld/mysqld.sock'
      });

      await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
      await connection.end();

      const db = await mysql.createConnection({
        socketPath: '/var/run/mysqld/mysqld.sock',
        database: 'DogWalkService'
      });

      await db.execute(`
        CREATE TABLE IF NOT EXISTS Dogs (
          dog_id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT NOT NULL,
          name VARCHAR(50) NOT NULL,
          size ENUM('small', 'medium', 'large') NOT NULL,
          FOREIGN KEY (owner_id) REFERENCES Users(user_id)
        );
      `);
      await connection.execute(`
        INSERT INTO Dogs (name, size, owner_id) VALUES
        ('Jack', 'large', (SELECT user_id FROM Users WHERE username = 'alice123')),
      `);
      await connection.end();


    } catch (error) {
      console.error('Database setup error: ', error);
    }
});


router.get('/dogs', async function(req, res, next) {


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