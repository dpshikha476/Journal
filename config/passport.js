const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Load User model
const User = require('../Database/models/userModel');
module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },
      (email, password, done) => {
        //Match user
        User.findOne({ email: email })
          .then((user) => {
            if (!user) {
              return done(null, false, { message: 'Email is not registered' });
            }

            //Match the passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              // if (isMatch) {
                if(password == user.password){
                return done(null, user);
              } else {
                return done(null, false, { message: 'Password Incorrect' });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
