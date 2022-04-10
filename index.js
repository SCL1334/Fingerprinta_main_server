require('dotenv').config();

const {
  PORT, API_VERSION,
} = process.env;

// Express Initialization
const express = require('express');

const app = express();

app.set('json spaces', 2);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(`/api/${API_VERSION}`, [
  require('./routes/attendance_route'),
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
