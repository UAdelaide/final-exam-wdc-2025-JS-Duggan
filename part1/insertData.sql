-- Insert 5 users
INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('davidK9', 'david@example.com', 'hashedabc', 'owner'),
('evewalker', 'eve@example.com', 'hasheddef', 'walker');

-- Insert 5 dogs
INSERT INTO Dogs (name, size, owner_id) VALUES
('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
('Rocky', 'large', (SELECT user_id FROM Users WHERE username = 'davidK9')),
('Luna', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Milo', 'small', (SELECT user_id FROM Users WHERE username = 'carol123'));

-- Insert 5 walk requests
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT owner_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
((SELECT owner_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
((SELECT owner_id FROM Dogs WHERE name = 'Rocky'), '2025-06-11 10:00:00', 60, 'Hilltop Trail', 'open'),
((SELECT owner_id FROM Dogs WHERE name = 'Luna'), '2025-06-11 11:15:00', 30, 'Riverbank Park', 'completed'),
((SELECT owner_id FROM Dogs WHERE name = 'Milo'), '2025-06-12 14:00:00', 45, 'Downtown Green', 'cancelled');