import socketio from 'socket.io'

const timeout = 1000 // milliseconds

export default function socket (datastore, room_dicebot) {
  var io = socketio()

  io.sockets.on('connection', (socket) => {
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
            if (err) throw err
            socket.emit("init_log", logs)
          })
        } else {
          socket.disconnect()
        }
      })
    })

    socket.on('roll', (data) => {
      io.sockets.to(socket.room).emit('roll', data)
      datastore.addDiceLog(socket.room, data.log)
    })

    socket.on('update_memo', (request) => {
      request.room = socket.room
      datastore.createOrUpdateMemo(request, (resp) => {
        io.sockets.to(socket.room).emit('update_memo', resp)
      })
    })
  })

  return io
}
