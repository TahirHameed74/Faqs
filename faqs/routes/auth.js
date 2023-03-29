var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const { Client } = require('pg');
var passport = require('passport');

var dbConf = require('../config/db');
const client = new Client(dbConf);
client.connect()

router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.post('/signup', async function (req, res, next) {
  const { email, password } = req.body;
  const passwordhash = await bcrypt.hash(password, 10);

  try {
    result = await client.query(`INSERT INTO users (username, password) VALUES ('${email}', '${passwordhash}');`);
    res.redirect('/auth/login');
  } catch (err) {
    console.log(err);
    res.redirect('/')
  }
});


router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (error, user, info) {
    if (error) {
      res.redirect('/');
    } else if (!user) {
      res.redirect('/');
    } else {
      req.login(user, (err) => {
        if (err) {
          res.redirect('/');
        } else {
          res.redirect('/admin/');
        }
      });
    }
  })(req, res);
});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
