const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Message = require('../models/message');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  res.render('login', { errorMessage: req.session.errorMessage });
  req.session.errorMessage = null;
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    res.redirect('/chat');
  } else {
    req.session.errorMessage = 'Invalid username or password';
    res.redirect('/');
  }
});

router.get('/register', (req, res) => {
  res.render('register', { errorMessage: req.session.errorMessage });
  req.session.errorMessage = null;
});

router.post('/register', async (req, res) => {
  const { name, username, password } = req.body;

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    req.session.errorMessage = 'Username already taken';
    res.redirect('/register');
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, password: hashedPassword });
    await newUser.save();
    res.redirect('/');
  }
});

router.get('/chat', async (req, res) => {
  if (req.session.user) {
    const allUsers = await User.find({}, 'username');

    const messages = await Message.find({}).sort({ timestamp: 1 });

    res.render('chat', {
      username: req.session.user.username,
      userId: req.session.user.id,
      allUsers: allUsers.map((user) => user.username),
      messages: messages.map((message) => ({ username: message.username, content: message.content }))
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
