require('dotenv').config();
const redis = require('redis');

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
  console.log('Redis is ready');
});

redisClient.on('error', (err) => {
  redisClient.ready = false;
  console.log('Error in Redis');
  console.log(err);
});

redisClient.on('end', () => {
  redisClient.ready = false;
  console.log('Redis is disconnected');
});

module.exports = redisClient;
