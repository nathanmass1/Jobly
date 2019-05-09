/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "test";
const JWT_SECRET = process.env.JWT_SECRET || "JWTsecret";
const BCRYPT_WORK_ROUNDS = 10;


const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "jobly-test";
} else {
  DB_URI = process.env.DATABASE_URL || "jobly";
}

module.exports = {
  SECRET_KEY,
  JWT_SECRET,
  BCRYPT_WORK_ROUNDS,
  PORT,
  DB_URI
};
