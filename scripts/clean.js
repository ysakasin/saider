"use strict"

const config = require('../config.json');

const DataStore = require('../lib/datastore.js');
const datastore = new DataStore(config);

const date = new Date;
const time = date.getTime();

const limit_day = Number(process.env.LIMIT_DAY) || 7;

const limit = limit_day * 24 * 60 * 60 * 1000;

datastore.getTimes((times) => {
  for (let room in times) {
    if (time - times[room] >= limit) {
      datastore.deleteRoom(room);
      console.log("Delete:" + room);
    }
  }
  console.log("Compleated clean rooms.");
  datastore.quit();
});
