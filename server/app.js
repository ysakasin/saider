import {generateId, passwordToHash, loadConfig} from './helper'
import escapeHTML from 'escape-html'

let config = loadConfig();

import express from 'express'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import ECT from 'ect'
import path from 'path'

/* for dev */
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpack from 'webpack'
import webpackConfig from '../config/webpack.config'


var dicebotList = {
  'dicebot': '標準ダイスボット',
  'cthulhu': 'クトゥルフ神話TRPG',
};

const vue_app = path.resolve(__dirname, '../index.html')

export default function app(datastore, dicebots, room_dicebot) {
  const app = express();

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", `${config.hostname}`, `ws://${config.hostname}`],
          imgSrc: ["'self'", '*'],
          styleSrc: ["'self'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
        },
      },
    }))
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  var ectRenderer = ECT({ watch: true, root: `${__dirname}/views`, ext : '.ect' });
  app.engine('ect', ectRenderer.render);
  app.set('view engine', 'ect');

  app.get('/', (req, res) => {
    res.sendFile(vue_app);
  })

  app.get('/:room_id', (req, res) => {
    res.sendFile(vue_app)
  })

  app.get('/api/rooms', (req, res) => {
    datastore.getRooms((room_names, passwords) => {
      let rooms = []
      for (var id in room_names) {
        let room = {
          id: id,
          name: room_names[id],
          has_password: Boolean(passwords[id])
        }
        rooms.push(room)
      }
      res.send(rooms)
    })
  })

  app.post('/api/rooms/new', (req, res) =>{
    var room_id = generateId();
    var room_name = req.param('name') || "デフォルト名"
    var room_password = req.param('password') || ""
    var dicebot_id = req.param('dicebot') || "dicebot"

    console.log(room_name)
    console.log(room_password)
    console.log(dicebot_id)

    if (room_password != '') {
      var hash = passwordToHash(room_password)
      datastore.setPassword(room_id, hash)
    }

    if (!(dicebot_id in dicebotList)) {
      dicebot_id = 'dicebot'
    }

    room_dicebot[room_id] = dicebot_id
    datastore.setDicebot(room_id, dicebot_id)
    datastore.setRoom(room_id, room_name)
    datastore.updateTime(room_id)

    res.send({room_id: room_id})
  })

  app.get('/api/rooms/:room_id', (req, res) => {
    let room_id = req.params.room_id
    datastore.findRoom(room_id, (err, room) => {
      if (err) {
        res.status(500).send({ok: false, reason: "internal error"})
      }
      else if (room == null) {
        res.status(404).send({ok: false, reason: err.message})
      }
      else {
        let resp = {
          name: room.name,
          is_need_password: (room.password !== "")
        }
        res.send({ok: true, room: resp})
      }
    })
  })


  if (process.env.NODE_ENV !== 'production') {
    const compiler = webpack(webpackConfig)
    app.use('/dist', webpackDevMiddleware(compiler))
  }
  else {
    app.use('/dist', express.static('dist'))
  }

  app.use(express.static('public'));

  return app
}
