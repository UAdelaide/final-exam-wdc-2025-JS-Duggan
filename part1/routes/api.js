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
        CREATE TABLE Users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('owner', 'walker') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE Dogs (
          dog_id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT NOT NULL,
          name VARCHAR(50) NOT NULL,
          size ENUM('small', 'medium', 'large') NOT NULL,
          FOREIGN KEY (owner_id) REFERENCES Users(user_id)
      );

      CREATE TABLE WalkRequests (
          request_id INT AUTO_INCREMENT PRIMARY KEY,
          dog_id INT NOT NULL,
          requested_time DATETIME NOT NULL,
          duration_minutes INT NOT NULL,
          location VARCHAR(255) NOT NULL,
          status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
      );

      CREATE TABLE WalkApplications (
          application_id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          walker_id INT NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
          FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
          FOREIGN KEY (walker_id) REFERENCES Users(user_id),
          CONSTRAINT unique_application UNIQUE (request_id, walker_id)
      );

      CREATE TABLE WalkRatings (
          rating_id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          walker_id INT NOT NULL,
          owner_id INT NOT NULL,
          rating INT CHECK (rating BETWEEN 1 AND 5),
          comments TEXT,
          rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
          FOREIGN KEY (walker_id) REFERENCES Users(user_id),
          FOREIGN KEY (owner_id) REFERENCES Users(user_id),
          CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
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