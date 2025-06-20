const express = require('express');
// Add imports for required libraries
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
// add cookie parser middleware
app.use(cookieParser());
// add urlencoded false so form will correctly interpret
app.use(express.urlencoded({ extended: false }));
// add session middleware
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const dogRoutes = require('./routes/dogRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
// add dog 
app.use('/api/dog/', dogRoutes);

// Export the app instead of listening here
module.exports = app;
