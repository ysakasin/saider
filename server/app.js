import config from './config'

import express from 'express'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import path from 'path'
import nanoid from 'nanoid'

/* for dev */
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'
import webpackConfig from '../config/webpack.config'

const vue_app = path.resolve(__dirname, '../index.html')

export default function app (datastore, room_dicebot) {
  const app = express()

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", `${config.http.hostname}`, `ws://${config.http.hostname}`],
          imgSrc: ["'self'", '*'],
          styleSrc: ["'self'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com']
        }
      }
    }))
  }
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  app.get('/', (req, res) => {
    res.sendFile(vue_app)
  })

  app.get('/:room_id', (req, res) => {
    res.sendFile(vue_app)
  })

  app.get('/api/rooms', (req, res) => {
    datastore.findAllRooms((err, rooms) => {
      if (err) {
        res.status(500).send({ok: false, reason: "internal error"})
        return
      }

      const resp = rooms.map((room) => {
        return {
          id: room.id,
          name: room.name,
          dicebot: room.dicebot,
          has_password: Boolean(room.password)
        }
      })
      res.send(resp)
    })
  })

  app.post('/api/rooms/new', (req, res) => {
    var room_id = nanoid()
    var room_name = req.param('name') || "デフォルト名"
    var room_password = req.param('password') || ""
    var dicebot_id = req.param('dicebot') || "dicebot"

    datastore.createRoom(room_id, room_name, dicebot_id, room_password)

    res.send({room_id: room_id})
  })

  app.get('/api/rooms/:room_id', (req, res) => {
    let room_id = req.params.room_id
    datastore.findRoom(room_id, (err, room) => {
      if (err) {
        res.status(500).send({ok: false, reason: "internal error"})
      } else if (room == null) {
        res.status(404).send({ok: false, reason: err.message})
      } else {
        let resp = {
          name: room.name,
          dicebot: room.dicebot,
          is_need_password: (room.password !== "")
        }
        res.send({ok: true, room: resp})
      }
    })
  })

  if (process.env.NODE_ENV !== 'production') {
    const compiler = webpack(webpackConfig)
    app.use('/dist', webpackDevMiddleware(compiler))
  } else {
    app.use('/dist', express.static('dist'))
  }

  app.use(express.static('public'))

  return app
}
