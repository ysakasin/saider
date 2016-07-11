var helper = require('./lib/helper');
var config = (process.env.NODE_ENV === 'production')
              ? require('./config.json')
              : require('./config.dev.json');

/* datastore */

var DataStore = require('./lib/datastore');
var datastore = new DataStore(config);

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

var headerCSP = helper.cspParams(config.host);

app.get('/*', function(req,res,next) {
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Content-Security-Policy', headerCSP);
  next();
});

app.get('/', function(req, res) {
  datastore.getRooms(function(rooms, passwords) {
    res.render('index', { rooms: rooms, passwords: passwords, escape: helper.escapeHTML });
  });
});

app.post('/create-room', function (req, res) {
  var room_id = helper.generateId();
  var room_name = req.param('room-name');
  var use_password = req.param('use-password');
  var room_password = req.param('room-password');

  if (room_password != '') {
    var hash = helper.passwordToHash(room_password);
    datastore.setPassword(room_id, hash);
  }

  res.redirect('./' + room_id);

  datastore.setRoom(room_id, room_name);
});

app.get('/licenses', function(req, res) {
  res.sendFile(__dirname + '/licenses.html');
});

app.get('/:room_id', function(req, res) {
  var room_id = req.params.room_id;
  datastore.isExistRoom(room_id, function(err, is_exist) {
    if (is_exist) {
      datastore.isExistPassword(room_id, function (err, is_need_password) {
        res.render('room', {
          room_id: room_id,
          is_need_password: is_need_password,
          escape: helper.escapeHTML
        });
      });
    }
    else {
      res.redirect('./');
    }
  });
});

app.use(express.static('public'));

server.listen(31102, function() {
  console.log('listening on *:31102');
});

/* socketio */

var io = require('socket.io')(server);
var DiceBot = require('./lib/dicebot/dicebot');
var dicebot = new DiceBot();
var user_hash = {};

io.sockets.on('connection', function(socket) {

  socket.on('connected', function(user) {
    datastore.isExistRoom(user.room, function(err, is_exist) {
      if (!is_exist) {
        socket.disconnect();
        return;
      }

      datastore.getPassword(user.room, function (err, pass) {
        if (pass == null || pass == helper.passwordToHash(user.password)) {
          socket.emit('accepted');

          datastore.getAllResult(user.room, function (err, results) {
            results = results.map(JSON.parse);
            socket.emit('init-result', results);
          });

          datastore.getAllMemo(user.room, function (err, memos) {
            var res = {};
            for (memo_id in memos) {
              res[memo_id] = JSON.parse(memos[memo_id]);
            }
            socket.emit('init-memo', res);
          });

          datastore.getMap(user.room, function (err, url) {
            if (url == null) {
              url = './image/tsukuba.jpg';
            }
            socket.emit('map', {url: url});
          });

          user_hash[socket.id] = user.name
          socket.name = user.name;
          socket.room = user.room;
          socket.join(user.room);
        }
        else {
          socket.emit('rejected');
        }
      });
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
    datastore.setResult(socket.room, json);
  });

  socket.on('memo', function(request) {
    datastore.createMemo(socket.room, request.title, request.body, function(data) {
      io.sockets.to(socket.room).emit('memo', data);
    });
  });

  socket.on('update-memo', function(request) {
    var data = {
      memo_id: request.memo_id,
      title: request.title,
      body: request.body
    };
    io.sockets.to(socket.room).emit('update-memo', data);

    datastore.setMemo(socket.room, request.memo_id, JSON.stringify(data));
  });

  socket.on('delete-memo', function(memo_id) {
    io.sockets.to(socket.room).emit('remove-memo', memo_id);

    datastore.deleteMemo(socket.room, memo_id);
  });

  socket.on('map', function(request) {
    io.sockets.to(socket.room).emit('map', request);

    datastore.setMap(socket.room, request.url);
  });

  socket.on('delete-room', function() {
    io.sockets.to(socket.room).emit('room-deleted');
    datastore.deleteRoom(socket.room);
  });

  socket.on('disconnect', function() {
    if (user_hash[socket.id]) {
      delete user_hash[socket.id];
    }
  });
});
