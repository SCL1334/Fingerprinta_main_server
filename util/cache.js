require('dotenv').config();
const redis = require('redis');
const Logger = require('./logger');

const {
  CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD,
} = process.env;

const redisClient = redis.createClient({
  legacyMode: true,
  host: CACHE_HOST,
  port: CACHE_PORT,
  user: CACHE_USER,
  password: CACHE_PASSWORD,
});

redisClient.ready = false;

redisClient.on('ready', () => {
  redisClient.ready = true;
  new Logger('Redis is ready').info();
});

redisClient.on('error', (error) => {
  redisClient.ready = false;
  new Logger('Error in Redis').error();
  new Logger(error).error();
});

redisClient.on('end', () => {
  redisClient.ready = false;
  new Logger('Redis is disconnected').error();
});

module.exports = redisClient;
