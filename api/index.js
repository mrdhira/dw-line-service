const Webhook = require('./handlers/webhook');

module.exports = {
  register: (server) => {
    server.route([
      { method: 'POST', path: '/webhook/logbook', config: Webhook.logbookHandler },
    ]);
  },
  name: 'api-plugin'
};
