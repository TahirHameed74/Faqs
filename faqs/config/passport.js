var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const { Client } = require('pg')
var dbConf = require('../config/db');

var bcrypt = require('bcrypt');

const client = new Client(dbConf);
client.connect()


passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  client.query(`SELECT * FROM users WHERE id='${id}';`).then(result => {
    if (result.rows.length == 0) {
      return cb('User not found');
    }
    return cb(null, result.rows[0]);
  }).catch(err => {
    return cb('User not found');
  });
});



passport.use(new LocalStrategy(
  function(username, password, done) {
    client.query(`SELECT * FROM users WHERE username='${username}';`).then(result => {
      if (result.rows == 0) {
        return done(null, false);
      } else {
        bcrypt.compare(password, result.rows[0].password, (err, res) => {
          if (err) {
            return done(null, false);
          } else if (res) {
            return done(null, result.rows[0]);
          } else {
            return done(null, false);
          }
        });
      }
    }).catch(err => {
      return done(err);
    });
  }
));
