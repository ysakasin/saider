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

var isDiceRequest = function(req) {
  return /^\d+[dD]\d+(([+-]\d+[dD]\d+)|([+-]\d+))*([<>]=?\d+)?$/.test(req);
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

  socket.on('roll', function(request) {
    if (!isDiceRequest(request)) {
      console.log('is no request');
      return;
    }
    var comp = (request.match(/[<>]=?\d+/) || [])[0];
    var formula = request.replace(/[<>]=?\d+/, '');

    var res = {};
    var rolled = [];

    var dices = formula.match(/\d+[dD]\d+/g);
    dices.forEach(function(dice){
      var data = dice.split(/d|D/);
      var result = rollDice(parseInt(data[0]), parseInt(data[1]));
      formula = formula.replace(dice, result.total);
      rolled.push(result);
    });

    res['name'] = user_hash[socket.id];
    res['request'] = request;
    res['dices'] = rolled;
    res['total'] = eval(formula);
    if (comp != null) {
      res['result'] = eval(res.total + comp) ? '成功' : '失敗';
    }

    io.sockets.to(socket.room).emit('roll', res);
  });

  socket.on('leave', function() {
    var room = socket.room;
    socket.leave(socket.room);
    if (user_hash[socket.id]) {
      var msg = user_hash[socket.id] + 'が退出しました';
      delete user_hash[socket.id];
      io.sockets.to(socket.room).emit('publish', {value: msg});
    }
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
