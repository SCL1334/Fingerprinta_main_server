require('dotenv').config();
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const express = require('express');
const Cache = require('./util/cache');
const { authentication } = require('./util/authentication');
const ResponseTransformer = require('./util/response');
const Logger = require('./util/logger');

// routes
const publicRoute = require('./routes/public_route');
const userRoute = require('./routes/user_route');
const classRoute = require('./routes/class_route');
const calendarRoute = require('./routes/calendar_route');
const leaveRoute = require('./routes/leave_route');
const sensorRoute = require('./routes/sensor_route');
const fingerprintRoute = require('./routes/fingerprint_route');
const myRoute = require('./routes/my_route');

const { PORT } = process.env;

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
    maxAge: 1000 * 60 * 60 * 10,
  },
}));

// API routes
// general use
app.use('/api/1.0', publicRoute);
// student use 0: all user can access
app.use('/api/1.0', authentication(0), myRoute);
// staff use 1: only staff can access
app.use('/api/1.0', authentication(1), [
  userRoute, classRoute, calendarRoute, leaveRoute, sensorRoute, fingerprintRoute,
]);

// server test
app.get('/healthCheck', (req, res) => {
  res.send('OK');
});

// 404 error
app.use((req, res) => {
  const transformer = new ResponseTransformer({ errCode: 3999 });
  res.status(transformer.httpCode).json(transformer.response);
});

// Error handling
app.use((err, req, res, next) => {
  new Logger(err).error();
  const transformer = new ResponseTransformer({ errCode: 2999 });
  res.status(transformer.httpCode).json(transformer.response);
});

app.listen(PORT, async () => {
  Cache.connect().catch(() => {
    new Logger('Redis connect fail').error();
  });
  new Logger(`Server is running on port ${PORT}`).info();
});
