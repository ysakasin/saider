import {loadConfig} from './helper'
import DataStore from './datastore'

import App from './app'
import http from 'http'
import Socket from './socket'

let config = loadConfig()

var datastore = new DataStore(config)
var room_dicebot = {}

const app = App(datastore, room_dicebot)
const socket = Socket(datastore, room_dicebot)
const server = http.Server(app)

socket.attach(server)

server.listen(config.port, () => {
  console.log(`listening on ${config.host}`)
})
