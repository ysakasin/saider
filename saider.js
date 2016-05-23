var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var dicebot = require ('./lib/dicebot/dicebot.js');
var util = require('./lib/dicebot/module/util.js');
var botPaths = util.getDicebotPaths();
var bots = {};

var bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));


var counter = 0;
for (var botPath in botPaths) {
  bots[botPath] = require(botPath)
}


var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.engine('ect', ectRenderer.render);
app.set('view engine', 'ect');

var settings = JSON.parse(fs.readFileSync('./settings.json'));
var room_names = {'asdsad' : 'テストルーム'};

app.get('/', function(req, res) {
  res.render('list', { rooms: room_names });
});

app.post('/create-room', function (req, res) {
  console.log(req.param('room-name'))
  var room_id = counter.toString();
  counter++;

  room_names[room_id] = req.param('room-name');
  res.redirect('./' + room_id);
});

app.get('/:room_id', function(req, res) {
  var room_id = req.params.room_id;
  res.render('index');
});

app.get('/licenses', function(req, res) {
  res.sendFile(__dirname + '/licenses.html');
});

app.get('/room.json', function(request, response) {
  response.contentType('application/json');
  var amountJSON = JSON.stringify({amount: settings['amount_of_room']});
  response.send(amountJSON);
});

app.use(express.static('public'));

var user_hash = {};

io.sockets.on('connection', function(socket) {

  socket.on('connected', function(user) {
    console.log('connected');
    // if (user.room < 1 || user.room > settings['amount_of_room'] || user.name === '' || user.name == null)  {
    //   socket.disconnect();
    // }
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
    console.log(request);
    if (!dicebot.isDiceRequest(request)) {
      console.log('is no request');
      return;
    }

    var res = dicebot.roll(request)

    res['name'] = user_hash[socket.id];
    res['request'] = request;

    io.sockets.to(socket.room).emit('roll', res);
  });

  socket.on('memo', function(request) {
    io.sockets.to(socket.room).emit('memo', request);
  });

  socket.on('map', function(request) {
    io.sockets.to(socket.room).emit('map', request);
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
