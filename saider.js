/* express */

var express = require('express');
var app = express();
var server = require('http').Server(app);
var fs = require('fs');

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.engine('ect', ectRenderer.render);
app.set('view engine', 'ect');

var next_room_id = 0;
var room_names = {};

app.get('/', function(req, res) {
  res.render('index', { rooms: room_names });
});

app.post('/create-room', function (req, res) {
  var room_id = next_room_id.toString();
  next_room_id++;

  room_names[room_id] = req.param('room-name');
  res.redirect('./' + room_id);
});

app.get('/licenses', function(req, res) {
  res.sendFile(__dirname + '/licenses.html');
});

app.get('/:room_id', function(req, res) {
  var room_id = req.params.room_id;
  res.render('room');
});

app.use(express.static('public'));

server.listen(31102, function() {
  console.log('listening on *:31102');
});

/* socketio */

var io = require('socket.io')(server);
var dicebot = require ('./lib/dicebot/dicebot.js');
var user_hash = {};

io.sockets.on('connection', function(socket) {

  socket.on('connected', function(user) {
    user_hash[socket.id] = user.name
    socket.name = user.name;
    socket.room = user.room;
    socket.join(user.room);
  });

  socket.on('roll', function(request) {
    if (!dicebot.isDiceRequest(request)) {
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

  socket.on('disconnect', function() {
    if (user_hash[socket.id]) {
      delete user_hash[socket.id];
    }
  });
});
