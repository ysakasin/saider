const config = process.env.NODE_ENV === 'production'
  ? require("../config/config.json")
  : require("../config/config.dev.json")

export default config
