import crypto from 'crypto';

const seed = Date.now() * Math.random();
let serial = 1;

export function generateId() {
  const data = seed + ':' + serial++;
  return crypto.createHash('sha1').update(data).digest('hex');
}

export function passwordToHash(password) {
  let sha512 = crypto.createHash('sha512');
  sha512.update(password);
  return sha512.digest('hex');
}

export function either(value) {
  return (option) => value ? value : option;
}

const DEFAULT_HOSTNAME = '0.0.0.0';
const DEFAULT_PORT = 80;
let config = null;

export function loadConfig() {
  if (config != null) {
    return config;
  }

  if (process.env.ON_HEROKU === 'true') {
    const {env: {HEROKU_APP_NAME, PORT}} = process;
    config = { host: `${HEROKU_APP_NAME}.herokuapp.com:${PORT || DEFAULT_PORT}` };
  }
  else {
    config = (process.env.NODE_ENV === 'production')
      ? require('../config.json')
      : require('../config.dev.json');
  }

  if (!config.host) {
    config.host = `${either(config.hostname)(DEFAULT_HOSTNAME)}:${either(config.port)(DEFAULT_PORT)}`;
  }

  return config;
}

export default {
  either,
  generateId,
  passwordToHash,
  loadConfig,
};
