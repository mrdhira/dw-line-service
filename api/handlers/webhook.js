const Logbook = require('../controllers/logbook');

module.exports = {
  logbookHandler: {
    tags: ['logbook'],
    handler: Logbook.webhook,
  },
};
