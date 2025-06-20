var express = require('express');
var router = express.Router();

router.get('/dogs', function(req, res, next) {
  try {

  } catch (error) {
    res.status(400).send();
  }
});

router.get('/walkrequests/open', function(req, res, next) {
  try {
    res.status(200).send()
  } catch (error) {
    res.status(400).send();
  }
});

router.get('/walkers/summary', function(req, res, next) {
  try {

  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;