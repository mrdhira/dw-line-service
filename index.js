const Hapi = require('hapi');
const cron = require('./api/controllers/cron');
require('dotenv').config();

// Create a server with a host and port
const server =
  Hapi.server({
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT,
  });

// Start the server
const start = async function () {
  try {
    await server.register(require('./api'));
    if (process.env.ENABLE_CRON) {
      await cron.start();
    };
    await server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('Server running at:', server.info.uri);
};

start();