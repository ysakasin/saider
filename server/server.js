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

/* express */

import App from './app'
import http from 'http'
import Socket from './socket'

const app = App(datastore, room_dicebot)
const socket = Socket(datastore, room_dicebot)
const server = http.Server(app);

socket.attach(server)

server.listen(config.port, function() {
  console.log(`listening on ${config.host}`);
});

