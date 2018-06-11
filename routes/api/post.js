const express = require('express');
const router = express.Router();

// @route   GET api/post/testPost
// @desc    test post route
// @access  Public
router.get('/testPost', (req, res) => res.json({msg: "this is from posts"}));

module.exports = router;
