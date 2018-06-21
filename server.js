const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const debug = require('debug')('server');
const path = require('path');


const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const post = require('./routes/api/post');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to mongoDB
mongoose
  .connect(db)
  .then(() => debug('**** Connected to MongoDB ****'))
  .catch(err => debug(err));

//passport middleware
app.use(passport.initialize());

// Passport config
require('./config/passport.js')(passport);

app.use('/home', (req, res) => {
  res.json({home:"This will be the home/landing page"});
});

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/post', post);

// Serve static assets if in production
if(process.env.NODE_ENV === 'production') {

  // set static folder
  app.use(express.static('client/build'));

  // route
  app.get('*', (req, res ) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  debug(`Server up on ${port}`);
})
