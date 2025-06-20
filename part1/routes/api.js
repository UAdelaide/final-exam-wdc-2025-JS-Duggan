var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');


router.get('/dogs', async function(req, res, next) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS testdb');
    await connection.end();

    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'testdb'
    });

    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255)
      )
    `);

    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM books');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO books (title, author) VALUES
        ('1984', 'George Orwell'),
        ('To Kill a Mockingbird', 'Harper Lee'),
        ('Brave New World', 'Aldous Huxley')
      `);
    }


    let results;
    res.status(200).send(results);
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
