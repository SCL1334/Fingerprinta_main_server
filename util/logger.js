class Logger {
  constructor(message) {
    this.message = message;
  }

  info = () => {
    console.log(this.message);
  };

  error = () => {
    console.error(this.message);
  };
}

module.exports = Logger;
