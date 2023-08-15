const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const regexFilter = /https?:\/\/(www\.)?[-a-zA-Z0-9:%._+~#=]{1,}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const STATUS_CREATED = 201;

const {
  NODE_ENV = 'development',
  PORT = 3000,
  JWT_SECRET = 'dev-secret',
  DB_SERVER = 'mongodb://127.0.0.1:27017/bitfilmsdb',
} = process.env;

module.exports = {
  regexFilter,
  STATUS_CREATED,
  NODE_ENV,
  PORT,
  JWT_SECRET,
  DB_SERVER,
};
