import {MongoClient} from 'mongodb'
import redis from 'redis';
import url from 'url';
import {passwordToHash} from './helper'
let client;
let db;

const key = (target, id) => target + '.' + id;

const mongo_url = "mongodb://localhost:27017/saider"

export default class DataStore {
  constructor(config) {
    if (process.env.REDISTOGO_URL) {
      // For Heroku
      let rtg = url.parse(process.env.REDISTOGO_URL);
      client = redis.createClient(rtg.port, rtg.hostname);

      client.auth(rtg.auth.split(':')[1]);
    }
    else {
      client = redis.createClient(config.redis);
    }

    MongoClient.connect(mongo_url, (err, _db) => {
      if (err) throw err

      db = _db
    })
  }

  quit() {
    db.close()
    client.quit();
  }

  createRoom (id, name, dicebot, password) {
    const doc = {
      id: id,
      name: name,
      dicebot: dicebot,
      password: (password === "" ? "" : passwordToHash(password))
    }
    db.collection("room").insert(doc)
  }

  auth (id, password, callback) {
    db.collection("room").findOne({id: id}, (err, room) => {
      if (err) {
        callback(err, null)
        return
      } else if (room == null) {
        callback(new Error("not found room"), null)
        return
      }

      if (room.password === "") {
        callback(null, true)
      } else {
        callback(null, passwordToHash(password) === room.password)
      }
    })
  }

  /* room */

  findAllRooms (callback) {
    db.collection("room").find().toArray((err, rooms) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, rooms)
      }
    })
  }

  findRoom (room_id, callback) {
    db.collection("room").findOne({id: room_id}, (err, room) => {
      if (err) {
        callback(err, null)
      } else if (room == null) {
        callback(null, null)
      } else {
        callback(null, room)
      }
    })
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
        body: body,
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
      piece_id = 'piece-' + piece_id;
      var data = {
        piece_id: piece_id,
        url: url,
        x: x,
        y: y,
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
      y: y,
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
