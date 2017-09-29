import {MongoClient, ObjectId} from 'mongodb'
import {passwordToHash} from './helper'
let db

const mongo_url = "mongodb://localhost:27017/saider"

export default class DataStore {
  constructor (config) {
    MongoClient.connect(mongo_url, (err, _db) => {
      if (err) throw err

      db = _db
    })
  }

  quit () {
    db.close()
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

  /* DiceLog */
  findAllDiceLogById (room_id, callback) {
    db.collection("log").find({room_id: room_id}).toArray((err, logs) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, logs)
      }
    })
  }

  addDiceLog (room_id, log) {
    const doc = {
      room_id: room_id,
      log: log
    }
    db.collection("log").insert(doc)
  }

  findAllMemos (room_id, callback) {
    db.collection("memo").find({room_id: room_id}).toArray((err, memos) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, memos)
      }
    })
  }

  createOrUpdateMemo (data, callback) {
    if (data._id == null) {
      db.collection("memo").insertOne(data, (err, result) => {
        if (err) throw err
        data._id = result.insertedId
        callback(data)
      })
    } else {
      data._id = new ObjectId(data._id)
      db.collection("memo").update({_id: data._id}, data)
      callback(data)
    }
  }
}
