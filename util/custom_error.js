class GeneralError extends Error {
  constructor(errCode, message) {
    super(message);
    this.errCode = errCode;
    console.log(this);
  }
}

class MysqlError extends Error {
  constructor(errCode, message) {
    super(message);
    this.errCode = errCode;
    console.log(this);
  }
}

module.exports = { GeneralError, MysqlError };
