var helper = require('./lib/helper');
var redis = require('redis');
var client = redis.createClient();

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

app.get('/*', function(req,res,next) {
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

app.get('/', function(req, res) {
  client.hgetall('rooms', function(err, rooms) {
    res.render('index', { rooms: rooms, escape: helper.escapeHTML });
  });
});

app.post('/create-room', function (req, res) {
  client.incr('room_id', function(err, room_id){
    room_id = room_id.toString();
    var room_name = req.param('room-name');

    res.redirect('./' + room_id);

    client.hset('rooms', room_id, room_name);
  });
});

app.get('/licenses', function(req, res) {
  res.sendFile(__dirname + '/licenses.html');
});

app.get('/:room_id', function(req, res) {
  var room_id = req.params.room_id;
  client.hexists('rooms', room_id, function(err, is_exist) {
    if (is_exist) {
      client.lrange('results.' + room_id, 0, -1, function (err, results) {
        client.get('map.' + room_id, function (err, map) {
          if (map == null) {
            map = './image/tsukuba.jpg';
          }
          results = results.map(JSON.parse);
          res.render('room', {room_id: room_id, map:map, results: results, escape: helper.escapeHTML});
        });
      });
    }
    else {
      res.redirect('./');
    }
  })
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
    client.hexists('rooms', user.room, function(err, is_exist) {
      if (is_exist) {
        client.hgetall('memos.' + user.room, function (err, memos) {
          for (memo_id in memos) {
            memos[memo_id] = JSON.parse(memos[memo_id]);
          }
          socket.emit('init-memo', memos);
        });
        user_hash[socket.id] = user.name
        socket.name = user.name;
        socket.room = user.room;
        socket.join(user.room);
      }
      else {
        socket.disconnect();
      }
    });
  });

  socket.on('user-name', function (user_name) {
    user_hash[socket.id] = user_name;
  });

  socket.on('roll', function(request) {
    if (!dicebot.isDiceRequest(request)) {
      return;
    }

    var res = dicebot.roll(request)

    res['name'] = user_hash[socket.id];
    res['request'] = request;

    io.sockets.to(socket.room).emit('roll', res);

    var result_text = request + '→' + res.total;
    var json = JSON.stringify({name: user_hash[socket.id], text: result_text});
    var key = 'results.' + socket.room;
    client.rpush(key, json);
  });

  socket.on('memo', function(request) {
    client.incr('memo_id.' + socket.room, function(err, memo_id){
      var data = {
        memo_id: memo_id.toString(),
        title: request.title,
        body: request.body
      };
      io.sockets.to(socket.room).emit('memo', data);

      var key = 'memos.' + socket.room;
      client.hset(key, memo_id, JSON.stringify(data));
    });
  });

  socket.on('update-memo', function(request) {
    var data = {
      memo_id: request.memo_id,
      title: request.title,
      body: request.body
    };
    io.sockets.to(socket.room).emit('update-memo', data);

    var key = 'memos.' + socket.room;
    client.hset(key, request.memo_id, JSON.stringify(data));
  });

  socket.on('delete-memo', function(memo_id) {
    io.sockets.to(socket.room).emit('remove-memo', memo_id);

    var key = 'memos.' + socket.room;
    client.hdel(key, memo_id);
  });

  socket.on('map', function(request) {
    io.sockets.to(socket.room).emit('map', request);

    var key = 'map.' + socket.room;
    client.set(key, request.url);
  });

  socket.on('delete-room', function() {
    io.sockets.to(socket.room).emit('room-deleted');
    helper.deleteRoom(client, socket.room);
  });

  socket.on('disconnect', function() {
    if (user_hash[socket.id]) {
      delete user_hash[socket.id];
    }
  });
});
