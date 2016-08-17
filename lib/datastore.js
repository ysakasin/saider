"use strict"

const redis = require('redis');
let client;

const key = (target, id) => {
  return target + '.' + id;
};

class DataStore {
  constructor(config) {
    client = redis.createClient(config.redis);
  }

  quit() {
    client.quit();
  }

  /* room */
  getRooms(callback) {
    client.hgetall('room', function(err, rooms) {
      client.hgetall('password', function(err, passwords) {
        if (rooms == null) rooms = {};
        if (passwords == null) passwords = {};
        callback(rooms, passwords);
      });
    });
  }

  setRoom(id, name) {
    client.hset('room', id, name);
  }

  isExistRoom(id, callback) {
    client.hexists('room', id, callback);
  }

  /* password */
  getPassword(id, callback) {
    client.hget('password', id, callback);
  }

  setPassword(id, hash) {
    client.hset('password', id, hash);
  }

  isExistPassword(id, callback) {
    client.hexists('password', id, callback);
  }

  /* dicebot */

  getDicebot(id, callback) {
    client.hget('dicebot', id, callback);
  }

  getAllDicebot(callback) {
    client.hgetall('dicebot', function(err, dicebots) {
      if (dicebots == null) dicebots = {};
      callback(dicebots);
    });
  }

  setDicebot(id, hash) {
    client.hset('dicebot', id, hash);
  }

  /* result */
  getAllResult(id, callback) {
    client.lrange(key('result', id), 0, -1, callback);
  }

  setResult(id, json) {
    client.rpush(key('result', id), json);
  }

  /* memo */
  getAllMemo(id, callback) {
    client.hgetall(key('memo', id), callback);
  }

  createMemo(id, title, body, callback) {
    client.hincrby('memo_id', id, 1, function(err, memo_id){
      var data = {
        memo_id: memo_id.toString(),
        title: title,
        body: body
      };

      client.hset(key('memo', id), memo_id, JSON.stringify(data));
      callback(data);
    });
  }

  setMemo(id, memo_id, json) {
    client.hset(key('memo', id), memo_id, json);
  }

  deleteMemo(id, memo_id) {
    client.hdel(key('memo', id), memo_id);
  }

  /* map */
  getMap(id, callback) {
    client.hget('map', id, callback);
  }

  setMap(id, url) {
    client.hset('map', id, url);
  }

  createPiece(id, url, x, y, callback) {
    client.hincrby('piece_id', id, 1, (err, piece_id) => {
      piece_id = "piece-" + piece_id;
      var data = {
        piece_id: piece_id,
        url: url,
        x: x,
        y: y
      };

      client.hset(key('piece', id), piece_id, JSON.stringify(data));
      callback(data);
    });
  }

  updatePiece(id, piece_id, url, x, y) {
    var data = {
      piece_id: piece_id,
      url: url,
      x: x,
      y: y
    };

    client.hset(key('piece', id), piece_id, JSON.stringify(data));
  }

  getAllPiece(id, callback) {
    client.hgetall(key('piece', id), callback);
  }

  deletePiece(id, piece_id) {
    client.hdel(key('piece', id), piece_id);
  }

  deleteRoom(id) {
    client.hdel('map', id);
    client.del(key('memo', id));
    client.hdel('memo_id', id);
    client.del(key('result', id));
    client.hdel('room', id);
    client.hdel('password', id);
    client.hdel('dicebot', id);
    client.hdel('time', id);
    client.hdel('piece_id', id);
    client.del(key('piece', id));
  }

  /* time */

  updateTime(id) {
    const date = new Date;
    const time = date.getTime();

    client.hset('time', id, time);
  }

  getTimes(callback) {
    client.hgetall('time', function(err, times) {
      callback(times);
    });
  }
}

module.exports = DataStore;
