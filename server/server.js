import {generateId, passwordToHash, loadConfig} from './helper'
import escapeHTML from 'escape-html'

let config = loadConfig();

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

import App from './app'
import http from 'http'
import Socket from './socket'

console.log(dicebots)
console.log(room_dicebot)

const app = App(datastore, dicebots, room_dicebot)
const socket = Socket(datastore, dicebots, room_dicebot)
const server = http.Server(app);

socket.attach(server)

server.listen(config.port, function() {
  console.log(`listening on ${config.host}`);
});

