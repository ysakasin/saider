var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/licenses', function(req, res) {
  res.sendFile(__dirname + '/licenses.html');
});

app.use(express.static('public'));

var user_hash = {};

var rollDice = function(n, d) {
  var numbers = [];
  var total = 0;
  for (var i = 0; i < n; i++) {
    var dice = Math.ceil(Math.random() * d);
    total += dice;
    numbers.push(dice);
  }

  var result = {
    n: n,
    d: d,
    numbers: numbers,
    total: total
  };
  return result;
};

io.sockets.on('connection', function(socket) {

  socket.on('connected', function(user) {
    var msg = user.name + 'が入室しました';
    user_hash[socket.id] = user.name;
    socket.name = user.name;
    socket.room = user.room;
    socket.join(user.room);
    io.sockets.to(socket.room).emit('publish', {value: msg});
  });

  socket.on('publish', function(data) {
    io.sockets.to(socket.room).emit('publish', {value:data.value});
  });

  socket.on('roll', function(dice) {
    var res = rollDice(dice.n, dice.d);
    res['name'] = user_hash[socket.id];
    res['comp'] = dice.comp;
    if (dice.comp) {
      res['success'] = eval(res['total'] + dice.comp);
    }
    io.sockets.to(socket.room).emit('roll', res);
  });

  socket.on('disconnect', function() {
    if (user_hash[socket.id]) {
      var msg = user_hash[socket.id] + 'が退出しました';
      delete user_hash[socket.id];
      io.sockets.to(socket.room).emit('publish', {value: msg});
    }
  });
});

server.listen(31102, function() {
  console.log('listening on *:31102');
});
