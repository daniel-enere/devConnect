const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/keys');
const passport = require('passport');

//Load input validation
const validateRegisterInput = require('../../validation/registration');
const validateLoginInput = require('../../validation/login');

const router = express.Router();

const User = require('../../models/User') //User model

// @router  GET api/users/test
// @desc    test users route
// @access  Public
router.get('/test',
  (req, res) => {
  res.json({msg: "Users works fine"})
})

// @route GET api/users/register
// @desc allows for creation of new User
// @access Public
router.post('/register',
  (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
  .then(user => {
    if(user) {
      errors.email = 'Email already exists';
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', //Size
        r: 'pg', //Rating
        d: 'mm' //Default
      });


      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc login user/ Returning JWT Token
// @access Private
router.post('/login',
  (req, res) => {

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email})
    .then(user => {
      //check for user
      if(!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }

      //check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch) {
            // User matched
            const payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar
            }
            //sign Token
            jwt.sign(
              payload,
              jwtSecret.secretOrKey,
              { expiresIn: 360000 },
              (err, token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                });
              }
            );
          } else {
            errors.password = 'Incorrect Password';
            return res.status(400).json(errors);
          }
        });
    });
});

// @route POST api/users/current
// @desc return current user
// @access Private
router.get('/current',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    date: req.user.date
  });
});

module.exports = router;
