var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');

let db;

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
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS Dogs (
          dog_id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT NOT NULL,
          name VARCHAR(50) NOT NULL,
          size ENUM('small', 'medium', 'large') NOT NULL,
          FOREIGN KEY (owner_id) REFERENCES Users(user_id)
        );
      `);

      await db.execute(`
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
      `);

      await db.execute(`
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
      `);

      await db.execute(`
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
      let rows;
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

      [rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
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

      [rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRatings');
      if (rows[0].count === 0) {
        await db.execute(`
          INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
          (
            (SELECT request_id FROM WalkRequests WHERE location = 'Beachside Ave'),  -- Bella
            (SELECT user_id FROM Users WHERE username = 'bobwalker'),
            (SELECT user_id FROM Users WHERE username = 'carol123'),
            5,
            'Great walk, very attentive!'
          ),
          (
            (SELECT request_id FROM WalkRequests WHERE location = 'Riverbank Park'), -- Milo
            (SELECT user_id FROM Users WHERE username = 'evewalker'),
            (SELECT user_id FROM Users WHERE username = 'alice123'),
            4,
            'Good experience, but arrived slightly late.'
          );
        `);
      }

    } catch (error) {
      console.error('Database setup error: ', error);
    }
})();


router.get('/dogs', async function(req, res, next) {
  try {
    const [dogs] = await db.execute(`
      SELECT
        name as dog_name,
        size,
        (SELECT username FROM Users WHERE user_id = owner_id) as owner_username
      FROM
        Dogs;
      `);
    res.status(200).json(dogs);
  } catch (error) {
    res.status(400).send('Error: ' + error);
  }
});

router.get('/walkrequests/open', async function(req, res, next) {
  try {
    const [openRequests] = await db.execute(`
      SELECT
        request_id,
        name as dog_name,
        requested_time,
        duration_minutes,
        location,
        (SELECT username FROM Users WHERE user_id = owner_id) as owner_username
      FROM
        WalkRequests
        JOIN Dogs on Dogs.dog_id = WalkRequests.dog_id
      WHERE
        WalkRequests.status = 'open'
    `);
    res.status(200).json(openRequests);
  } catch (error) {
    res.status(400).send('Error: ' + error);
  }
});

router.get('/walkers/summary', async function(req, res, next) {
  try {
    const [walkers] = await db.execute(`
      SELECT
        username AS walker_username,
        COUNT(WalkRatings.rating_id) AS total_ratings,
        ROUND(AVG(WalkRatings.rating), 2) AS average_rating,
        COUNT(DISTINCT WalkRequests.request_id) AS completed_walks
      FROM
        Users
        JOIN WalkRatings on Users.user_id = WalkRatings.walker_id
        JOIN WalkRequests on WalkRequests.request_id = WalkRatings.request_id AND WalkRequests.status = 'completed'
      WHERE
        Users.role = 'walker'
      GROUP BY
        Users.user_id;
    `);
    res.status(200).send(walkers);
  } catch (error) {
    res.status(400).send('Error: ' + error);
  }
});

module.exports = router;
