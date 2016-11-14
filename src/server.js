import {cspParams, escapeHTML, generateId, passwordToHash} from './helper';
var config;
var port = 31102;

if (process.env.ON_HEROKU === 'true') {
    config = {
        "host": process.env.HEROKU_APP_NAME + ".herokuapp.com"
    }
    port = process.env.PORT;
}
else {
    config = (process.env.NODE_ENV === 'production')
        ? require('../config.json')
        : require('../config.dev.json');
}

/* datastore */

import DataStore from './datastore';
var datastore = new DataStore(config);
var room_dicebot = {};
datastore.getAllDicebot(function(dicebots) {
    room_dicebot = dicebots;
});

/* dicebot */

var dicebotList = {
    'dicebot': '標準ダイスボット',
    'cthulhu': 'クトゥルフ神話TRPG',
};
var dicebots = {};
for (const id in dicebotList) {
    var c = require(`./dicebot/${id}`);
    dicebots[id] = new c();
}

/* express */

var express = require('express');
var app = express();
var server = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.engine('ect', ectRenderer.render);
app.set('view engine', 'ect');

var headerCSP = cspParams(config.host);

app.get('/*', function(req,res,next) {
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Content-Security-Policy', headerCSP);
    next();
});

app.get('/', function(req, res) {
    datastore.getRooms(function(rooms, passwords) {
        res.render('index', {
            rooms: rooms,
            passwords: passwords,
            dicebot: dicebotList,
            escape: escapeHTML,
        });
    });
});

app.post('/create-room', function (req, res) {
    var room_id = generateId();
    var room_name = req.param('room-name');
    var room_password = req.param('room-password');
    var dicebot_id = req.param('dicebot');

    if (room_password != '') {
        var hash = passwordToHash(room_password);
        datastore.setPassword(room_id, hash);
    }

    if (!(dicebot_id in dicebotList)) {
        dicebot_id = 'dicebot';
    }
    room_dicebot[room_id] = dicebot_id;
    datastore.setDicebot(room_id, dicebot_id);

    res.redirect('./' + room_id);

    datastore.setRoom(room_id, room_name);
    datastore.updateTime(room_id);
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
                    dicebots: dicebotList,
                    dicebot: room_dicebot[room_id],
                    escape: escapeHTML,
                });
            });
        }
        else {
            res.redirect('./');
        }
    });
});

app.use(express.static('public'));

server.listen(port, function() {
    console.log('listening on *:31102');
});

/* socketio */

var io = require('socket.io')(server);
var user_hash = {};

io.sockets.on('connection', function(socket) {

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

    socket.on('roll', function(request) {
        var dicebot_id = room_dicebot[socket.room];
        var dicebot = dicebots[dicebot_id];
        var res = dicebot.roll(request);
        if (res == null) {
            return;
        }

        res['name'] = user_hash[socket.id];
        res['request'] = request;

        io.sockets.to(socket.room).emit('roll', res);

        var result_text = request + '→' + (res.total || res.result);
        var json = JSON.stringify({name: user_hash[socket.id], text: result_text});
        datastore.setResult(socket.room, json);
    });

    socket.on('dicebot', function(dicebot_id) {
        if (!(dicebot_id in dicebotList)) {
            return;
        }

        room_dicebot[socket.room] = dicebot_id;

        var bot = dicebots[dicebot_id];
        var res = {id: dicebot_id, name: bot.name, description: bot.description};
        io.sockets.to(socket.room).emit('dicebot', res);
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
            body: request.body,
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
