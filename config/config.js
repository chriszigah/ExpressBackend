var dotenv = require("dotenv");

process.env.NODE_ENV === undefined
  ? dotenv.config({ path: "./dev.env" })
  : dotenv.config();


