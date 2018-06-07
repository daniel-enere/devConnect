const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const debug = require('debug')('server');


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

app.get('/', (req, res) => {
  res.send('hello');
});

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/post', post);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  debug(`Server up on ${port}`);
})
