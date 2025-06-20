var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');

let db

(async () => {
  try {
      const connection = await mysql.createConnection({
        socketPath: '/var/run/mysqld/mysqld.sock'
      });

      await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
      await connection.end();

      db = await mysql.createConnection({
        socketPath: '/var/run/mysqld/mysqld.sock',
        database: 'DogWalkService'
      });
      // create tables if they dont already exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS Users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('owner', 'walker') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Dogs (
          dog_id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT NOT NULL,
          name VARCHAR(50) NOT NULL,
          size ENUM('small', 'medium', 'large') NOT NULL,
          FOREIGN KEY (owner_id) REFERENCES Users(user_id)
        );

        CREATE TABLE IF NOT EXISTS WalkRequests (
          request_id INT AUTO_INCREMENT PRIMARY KEY,
          dog_id INT NOT NULL,
          requested_time DATETIME NOT NULL,
          duration_minutes INT NOT NULL,
          location VARCHAR(255) NOT NULL,
          status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
        );

        CREATE TABLE IF NOT EXISTS WalkApplications (
          application_id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          walker_id INT NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
          FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
          FOREIGN KEY (walker_id) REFERENCES Users(user_id),
          CONSTRAINT unique_application UNIQUE (request_id, walker_id)
        );

        CREATE TABLE IF NOT EXISTS WalkRatings (
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

      // insert sample data if tables are empty
      let rows
      [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
      if (rows[0].count === 0) {
        await db.execute(`
          INSERT INTO Users (username, email, password_hash, role) VALUES
          ('alice123', 'alice@example.com', 'hashed123', 'owner'),
          ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
          ('carol123', 'carol@example.com', 'hashed789', 'owner'),
          ('davidK9', 'david@example.com', 'hashedabc', 'owner'),
          ('evewalker', 'eve@example.com', 'hasheddef', 'walker');
        `);
      }

      [rows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
      if (rows[0].count === 0) {
        await db.execute(`
          INSERT INTO Dogs (name, size, owner_id) VALUES
          ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
          ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
          ('Rocky', 'large', (SELECT user_id FROM Users WHERE username = 'davidK9')),
          ('Luna', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
          ('Milo', 'small', (SELECT user_id FROM Users WHERE username = 'carol123'));
        `);
      }

      [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
      if (rows[0].count === 0) {
        await db.execute(`
          INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
          ((SELECT owner_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
          ((SELECT owner_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
          ((SELECT owner_id FROM Dogs WHERE name = 'Rocky'), '2025-06-11 10:00:00', 60, 'Hilltop Trail', 'open'),
          ((SELECT owner_id FROM Dogs WHERE name = 'Luna'), '2025-06-11 11:15:00', 30, 'Riverbank Park', 'completed'),
          ((SELECT owner_id FROM Dogs WHERE name = 'Milo'), '2025-06-12 14:00:00', 45, 'Downtown Green', 'cancelled');
        `);
      }


    } catch (error) {
      console.error('Database setup error: ', error);
    }
});


router.get('/dogs', async function(req, res, next) {
  try {
    const [dogs] = db.execute('SELECT ')
  } catch {

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