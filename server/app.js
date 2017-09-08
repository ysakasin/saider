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
    var room_name = req.param('name');
    var room_password = req.param('password');
    var dicebot_id = req.param('dicebot');

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

  app.get('/licenses', function(req, res) {
    res.sendFile(`${__dirname }/licenses.html`);
  });

  app.get('/:room_id', function(req, res) {
    res.sendFile(vue_app);
    return
    var room_id = req.params.room_id;
    datastore.isExistRoom(room_id, function(err, is_exist) {
      if (is_exist) {
        datastore.isExistPassword(room_id, function (err, is_need_password) {
          res.render('room', {
            room_id: room_id,
            is_need_password: is_need_password,
            dicebots: dicebotList,
            dicebot: room_dicebot[room_id],
            escape: escapeHTML,
          });
        });
      }
      else {
        res.redirect('./');
      }
    });
  });


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
