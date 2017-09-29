import config from './config'
import DataStore from './datastore'

import App from './app'
import http from 'http'
import Socket from './socket'

var datastore = new DataStore(config.datastore)
var room_dicebot = {}

const app = App(datastore, room_dicebot)
const socket = Socket(datastore, room_dicebot)
const server = http.Server(app)

socket.attach(server)

server.listen(config.http.port, () => {
  console.log(`listening on ${config.http.host}:${config.http.port}`)
})
