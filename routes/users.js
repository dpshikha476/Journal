const router = require('express').Router();
const User = require('../Database/models/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { ensureAuthenticated } = require('../config/auth');

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

//Login Page
router.get('/login', (req, res) =>
  res.render('login', { title: 'User Login' })
);

//Register Page
router.get('/register', (req, res) =>
  res.render('register', { title: 'User Register' })
);

//Register handel
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all the fields!' });
  }

  //check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  //check pass length
  if (password.length < 1) {
    errors.push({ msg: 'Password should be at least 1 character!' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
    });
  } else {
    //Validation Pass
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User exists
        errors.push({ msg: 'Email Already Exists!' });
        res.render('register', {
          errors,
          name,
          email,
        });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
          blog: [],
        });
        newUser.isVerified = true;
        console.log(newUser);
        newUser.save();
        return res.redirect('/users/login');
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});


//Logout handel
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
