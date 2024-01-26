const express = require('express');
const mongoose = require('mongoose');

const session = require('express-session');
const socketio = require('socket.io');
const http = require('http');
const User = require('./models/user');
const Message = require('./models/message');
const router = require('./routes/routes');

const app = express();
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));

mongoose.connect('mongodb+srv://temo:iliauni@iliauni.sp7146r.mongodb.net/<name_lastname>?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use('/', router);

const io = socketio(server);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.emit('getUsers');

  socket.on('getUsers', async () => {
    const users = await User.find({}, 'username');
    io.emit('userList', users);
  });

  socket.on('setUsername', (username) => {
    socket.username = username;
    console.log('User connected with username:', username);
  });

  socket.on('chat message', async (message) => {
    console.log('socket.username', socket.username);

    const newMessage = new Message({
      content: message,
      username: socket.username
    });
    await newMessage.save();

    io.emit('chat message', { message, username: socket.username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
