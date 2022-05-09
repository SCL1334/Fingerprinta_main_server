require('dotenv').config();
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
// Express Initialization
const express = require('express');

// routes
const userRoute = require('./routes/user_route');
const classRoute = require('./routes/class_route');
const calendarRoute = require('./routes/calendar_route');
const leaveRoute = require('./routes/leave_route');
const sensorRoute = require('./routes/sensor_route');
const fingerprintRoute = require('./routes/fingerprint_route');

const {
  PORT, API_VERSION,
} = process.env;

const Cache = require('./util/cache');

const app = express();

app.set('json spaces', 2);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new RedisStore({ client: Cache }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 600, // 設定 session 的有效時間，單位毫秒
  },
}));

// API routes
app.use(`/api/${API_VERSION}`, [
  userRoute, classRoute, calendarRoute, leaveRoute, sensorRoute, fingerprintRoute,
]);

// server test
app.get('/', (req, res) => {
  res.send('OK');
});

// Error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, async () => {
  Cache.connect().catch(() => {
    console.log('Redis connect fail');
  });
  console.log(`Server is running on port ${PORT}`);
});
