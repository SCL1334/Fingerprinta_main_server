const Logger = require('./logger');

class GeneralError extends Error {
  constructor(errCode, message) {
    super(message);
    this.errCode = errCode;
    new Logger(this).error();
  }
}

class MysqlError extends Error {
  constructor(errCode, message) {
    super(message);
    this.errCode = errCode;
    new Logger(this).error();
  }
}

class ValidateError extends Error {
  constructor(errCode, message) {
    super(message);
    this.errCode = errCode;
    new Logger(this).error();
  }
}

module.exports = { GeneralError, MysqlError, ValidateError };
