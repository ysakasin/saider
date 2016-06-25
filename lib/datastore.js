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

  /* room */
  getRooms(callback) {
    client.hgetall('rooms', function(err, rooms) {
      client.hgetall('passwords', function(err, passwords) {
        if (rooms == null) rooms = {};
        if (passwords == null) passwords = {};
        callback(rooms, passwords);
      });
    });
  }

  setRoom(id, name) {
    client.hset('rooms', id, name);
  }

  isExistRoom(id, callback) {
    client.hexists('rooms', id, callback);
  }

  /* password */
  getPassword(id, callback) {
    client.hget('passwords', id, callback);
  }

  setPassword(id, hash) {
    client.hset('passwords', id, hash);
  }

  isExistPassword(id, callback) {
    client.hexists('passwords', id, callback);
  }

  /* result */
  getAllResult(id, callback) {
    client.lrange(key('results', id), 0, -1, callback);
  }

  setResult(id, json) {
    client.rpush(key('results', id), json);
  }

  /* memo */
  getAllMemo(id, callback) {
    client.hgetall(key('memos', id), callback);
  }

  createMemo(id, title, body, callback) {
    client.incr(key('memo_id', id), function(err, memo_id){
      var data = {
        memo_id: memo_id.toString(),
        title: title,
        body: body
      };

      client.hset(key('memos', id), memo_id, JSON.stringify(data));
      callback(data);
    });
  }

  setMemo(id, memo_id, json) {
    client.hset(key('memos', id), memo_id, json);
  }

  deleteMemo(id, memo_id) {
    client.hdel(key('memos', id), memo_id);
  }

  /* map */
  getMap(id, callback) {
    client.get(key('map', id), callback);
  }

  setMap(id, url) {
    client.set(key('map', id), url);
  }

  deleteRoom(id) {
    client.del(key('map', id));
    client.del(key('memos', id));
    client.del(key('memo_id', id));
    client.del(key('results', id));
    client.hdel('rooms', id);
    client.hdel('passwords', id);
  }
}

module.exports = DataStore;
