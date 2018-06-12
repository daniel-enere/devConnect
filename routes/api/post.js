const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const debug = require('debug')('server:post');

const post = require('../../models/Post'); // Post model
const Profile = require('../../models/Profile'); // Profile model
const validatePostInput = require('../../validation/post'); // Post validator

// @route   GET api/post/testPost
// @desc    test post route
// @access  Public
router.get('/testPost',
  (req, res) => res.json({msg: "this is from posts"}));

// @route   GET api/post
// @desc    get all posts
// @access  Public
router.get('/',
  (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({msg: "No posts found"}));
});

// @route   GET api/post/:post_id
// @desc    get a single post
// @access  Public
router.get('/:post_id',
  (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({msg: "No post found with id"}));
})

// @route POST api/post
// @desc  Create post
// @access  Private
router.post('/',
  passport.authenticate('jwt', { session: false}), (req, res) => {
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

//  @route    DELETE api/posts/:post_id
//  @desc     Delete post
// @access    Private
router.delete('/:post_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.post_id)
          .then(post => {
            // Check for post owner
            if(post.user.toString() !== req.user.id) {
              return res.status(401).json({ Unauthorized: 'User not authorized'});
            }
            post.remove().then(() => res.json({success: true}));
          })
          .catch(err => res.status(404).json({ success: false}));
      });
    // if(!post_id) res.status(404).json({msg: "post id not found"});
    // Post.findOneAndRemove(req.params.post_id)
    //   .then(post_id => {
    //     if(!req.params.post_id) res.status(404).json({msg: "post id not found"});
    //     // if(!post_id)
    //     res.status(200);
    //   })
    //   .catch(err => res.status(404).json({msg: "Post not found"}));

  })

  //  @route    POST  api/post/like/:id
  //  @desc     like post
  //  @access   Private
  router.post('/like/:post_id',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
    Profile.findOne({user: req.user.id})
      .then(profile => {
        Post.findById(req.params.post_id)
          .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
              return res.status(400).json({ liked: "User already liked this post"});
            }

            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ nopost: "No post found"}));
      });
  });

  //  @route    DELETE  api/post/unlike/:id
  //  @desc     remove like from post
  //  @access   Private
  router.post('/unlike/:post_id',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
    Profile.findOne({user: req.user.id})
      .then(profile => {
        Post.findById(req.params.post_id)
          .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
              return res
                .status(400)
                .json({ notliked: "User hasn't liked this post"});
            }

            // Get remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            // Splice out of array
            post.likes.splice(removeIndex, 1);

            // Save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ nopost: "No post found"}));
      });
  });

  //  @route    POST  api/post/comment/:post_id
  //  @desc     add comment
  //  @access   Private
  router.post('/comment/:post_id',
    passport.authenticate('jwt', {session: false }),
    (req, res) => {
      const { errors, isValid } = validatePostInput(req.body);

      // Check validation
      if(!isValid) {
        //if any errors, send 400 status with errors object
        return res.status(400).json(errors);
      }
      Post.findById(req.params.post_id)
        .then(post => {
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
          }

          // Add to comments array
          post.comments.unshift(newComment);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ nopost: "No post to comment to"}));

    });

  //  @route    DELETE  api/post/comment/:post_id/:comment_id
  //  @desc     delete comment
  //  @access   Private
  router.delete('/comment/:post_id/:comment_id',
    passport.authenticate('jwt', {session: false }),
    (req, res) => {

      Post.findById(req.params.post_id)
        .then(post => {

          // check if comment exists
          if(post.comments.filter(comment =>
            comment._id.toString() === req.params.comment_id).length === 0) {
              return res.status(404).json({ nocomment: "comment doesn't exist"});
          }

          // get comment index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

          // Only authorized users can delete comments
          if (req.user.id !== post.comments[removeIndex].user.toString()) {
            return res.status(401).json({ unauthorized: "User not authorized"})
          }

          // Splice comment out of array
          post.comments.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ nopost: "No post to comment to"}));
      });

module.exports = router;
