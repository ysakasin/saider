import socketio from 'socket.io'

var dicebotList = {
  'dicebot': '標準ダイスボット',
  'cthulhu': 'クトゥルフ神話TRPG',
};

const timeout = 1000 // milliseconds

export default function socket(datastore, room_dicebot) {
  var io = socketio();
  // io.serveClient(false);

  var user_hash = {};

  io.sockets.on('connection', function(socket) {

    setTimeout(() => {
      if (socket.authed !== true) {
        socket.disconnect()
      }
    }, timeout)

    socket.on("auth", (params) => {
      const room = params.room
      const password = params.password
      datastore.auth(room, password, (err, authed) => {
        console.log(err)
        if (authed) {
          socket.authed = true
          socket.room = room
          socket.join(room)

          datastore.findAllDiceLogById(socket.room, (err, logs) => {
            socket.emit("init_log", logs)
          })
        }
        else {
          socket.disconnect()
        }
      })
    })

    socket.on('connected', function(user) {
      datastore.isExistRoom(user.room, function(err, is_exist) {
        if (!is_exist) {
          socket.disconnect();
          return;
        }

        datastore.getPassword(user.room, function (err, pass) {
          if (pass == null || pass == passwordToHash(user.password)) {
            socket.emit('accepted');

            datastore.getAllResult(user.room, function (err, results) {
              results = results.map(JSON.parse);
              socket.emit('init-result', results);
            });

            datastore.getAllMemo(user.room, function (err, memos) {
              var res = {};
              for (const memo_id in memos) {
                res[memo_id] = JSON.parse(memos[memo_id]);
              }
              socket.emit('init-memo', res);
            });

            datastore.getAllPiece(user.room, function (err, pieces) {
              var res = {};
              for (const piece_id in pieces) {
                res[piece_id] = JSON.parse(pieces[piece_id]);
              }
              socket.emit('init-piece', res);
            });

            datastore.getMap(user.room, function (err, url) {
              if (url == null) {
                url = './image/tsukuba.jpg';
              }
              socket.emit('map', {url: url});
            });

            datastore.updateTime(user.room);

            var dicebot_id = room_dicebot[user.room];
            var bot = dicebots[dicebot_id];
            var res = {id: dicebot_id, name: bot.name, description: bot.description};
            socket.emit('dicebot', res);

            user_hash[socket.id] = user.name;
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

    socket.on('roll', (data) => {
      io.sockets.to(socket.room).emit('roll', data)
      datastore.addDiceLog(socket.room, data.log)
    })

    socket.on('dicebot', function(dicebot_id) {
      if (!(dicebot_id in dicebotList)) {
        return;
      }

      room_dicebot[socket.room] = dicebot_id;

      // var bot = dicebots[dicebot_id];
      var res = {id: dicebot_id, name: bot.name, description: bot.description};
      io.sockets.to(socket.room).emit('dicebot', res);
    });

    socket.on('memo', function(request) {
      datastore.createMemo(socket.room, request.title, request.body, function(data) {
        io.sockets.to(socket.room).emit('memo', data);
      });
    });

    socket.on('update_memo', (request) => {
      request.room = socket.room
      datastore.createOrUpdateMemo(request, (resp) => {
        io.sockets.to(socket.room).emit('update_memo', resp);
      })
    })

    socket.on('delete-memo', function(memo_id) {
      io.sockets.to(socket.room).emit('remove-memo', memo_id);

      datastore.deleteMemo(socket.room, memo_id);
    });

    socket.on('map', function(request) {
      io.sockets.to(socket.room).emit('map', request);

      datastore.setMap(socket.room, request.url);
    });

    socket.on('add-piece', function(request) {
      datastore.createPiece(socket.room, request, 0.5, 0.5, function(data) {
        io.sockets.to(socket.room).emit('add-piece', data);
      });
    });

    socket.on('move-piece', function(request) {
      datastore.updatePiece(socket.room, request.piece_id, request.url, request.x, request.y);
      io.sockets.to(socket.room).emit('move-piece', request);
    });

    socket.on('delete-piece', function(request) {
      datastore.deletePiece(socket.room, request);
      io.sockets.to(socket.room).emit('delete-piece', request);
    });

    socket.on('delete-room', function() {
      io.sockets.to(socket.room).emit('room-deleted');
      datastore.deleteRoom(socket.room);
    });

    socket.on('disconnect', function() {
      if (user_hash[socket.id]) {
        delete user_hash[socket.id];
      }
      datastore.updateTime(socket.room);
    });
  });

  return io
}
