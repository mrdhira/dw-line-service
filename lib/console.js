const chalk = require('chalk');

module.exports = {
  logRed: logRed = (text) => console.log(chalk.red.bold(text)),
  logGreen: logGreen = (text) => console.log(chalk.green.bold(text)),
  logBlue: logBlue = (text) => console.log(chalk.blue.bold(text)),
  statusMessage: statusMessage = (statusCode, message, error, data) => {
    console.log( { statusCode, message, error, data });
    return { statusCode, message, error, data };
  },
};
