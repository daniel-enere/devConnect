const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const post = require('../../models/Post'); // Post model
const validatePostInput = require('../../validation/post'); // Post validator

// @route   GET api/post/testPost
// @desc    test post route
// @access  Public
router.get('/testPost', (req, res) => res.json({msg: "this is from posts"}));

// @route POST api/post
// @desc  Create post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if(!isValid) {
    //if any errors, send 400 status with errors object
    return res.status(400).json(errors);
  }
  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });
  newPost.save().then(post => res.json(post));
});

module.exports = router;
