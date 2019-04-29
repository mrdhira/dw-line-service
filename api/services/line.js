const request = require('request');
const Promise = require('bluebird');
const Get = Promise.promisify(request.get);
const Post = Promise.promisify(request.post);
const { logGreen } = require('../../lib/console');

/**
 * replyMessage
 * @replyToken {string}
 * @messages
 * [
 *  {
 *    @type string
 *    @text string
 *  }
 * ]
 */
module.exports.replyMessage = (form, ACCESS_TOKEN) => {
  logGreen('Line Service - Reply Message...');
  console.log(form);
  return Post('https://api.line.me/v2/bot/message/reply', {
    headers: {
      ['Content-Type']: 'application/json',
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    body: form,
    json: true,
  });
};
// Returns the status code 200 and an empty JSON object.

/**
 * replyMessage
 * @userId {string}
 * @messages
 * [
 *  {
 *    @type string
 *    @text string
 *  }
 * ]
 */
module.exports.pushMessage = (form, ACCESS_TOKEN) => {
  logGreen('Line Service - Push Message...');
  console.log('FORM => ' + form);
  return Post('https://api.line.me/v2/bot/message/push', {
    headers: {
      ['Content-Type']: 'application/json',
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    body: form,
    json: true,
  });
};
// Returns the status code 200 and an empty JSON object.

/**
 * replyMessage
 * @to
 * [
 *  {
 *    @userId string
 *  }
 * ]
 * @messages
 * [
 *  {
 *    @type string
 *    @text string
 *  }
 * ]
 */
module.exports.multiCastMessage = (form, ACCESS_TOKEN) => {
  logGreen('Line Service - Multi Cast Message');
  console.log('FORM => ' + form);
  return Post('https://api.line.me/v2/bot/message/multicast', {
    headers: {
      ['Content-Type']: 'application/json',
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    body: form,
    json: true,
  });
};
// Returns the status code 200 and an empty JSON object.

/**
 * @messages
 * [
 *  {
 *    @type string
 *    @text string
 *  }
 * ]
 */
module.exports.broadCastMessage = (form, ACCESS_TOKEN) => {
  logGreen('Line Service - Broad Cast Message');
  console.log('FORM => ' + form);
  return Post('https://api.line.me/v2/bot/message/broadcast', {
    headers: {
      ['Content-Type']: 'application/json',
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    body: form,
    json: true,
  })
};
// Returns the status code 200 and an empty JSON object.

module.exports.getContent = (messageId, ACCESS_TOKEN) => {
  logGreen('Line Service - Get Content');
  console.log('MessageId => ' + messageId);
  return Post(`https://api.line.me/v2/bot/message/${messageId}/content`, {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
  }).then( (res) => JSON.parse(res.body));
};
// Returns status code 200 and the content in binary.

module.exports.getTargetLimitMessages = (ACCESS_TOKEN) => {
  logGreen('Line Service - Get Target Limit Messages');
  return Get('https://api.line.me/v2/bot/message/quota', {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
  }).then( (res) => JSON.parse(res.body));
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "type":"limited",
//   "value":1000
// }

module.exports.getNumberMessageSent = (ACCESS_TOKEN) => {
  logGreen('Line Service - Get Number Message Sent This Month');
  return Get('https://api.line.me/v2/bot/message/quota/consumption', {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
  }).then( (res) => JSON.parse(res.body));
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "totalUsage":"500"
// }

module.exports.getNumberReplyMessageSent = (date, ACCESS_TOKEN) => {
  logGreen('Line Service - Get Number Reply Message Sent in Speficy Date');
  console.log(date);
  return Get('https://api.line.me/v2/bot/message/delivery/reply', {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    params: date,
  }).then( (res) => JSON.parse(res.body));
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "status":"ready",
//   "success":10000
// }

module.exports.getNumberPushMessageSent = (date, ACCESS_TOKEN) => {
  logGreen('Line Service - Get Number Push Message Sent in Speficy Date');
  console.log(date);
  return Get('https://api.line.me/v2/bot/message/delivery/push', {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    params: date,
  }).then( (res) => JSON.parse(res.body));
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "status":"ready",
//   "success":10000
// }

module.exports.getNumberMultiCastMessageSent = (date, ACCESS_TOKEN) => {
  logGreen('Line Service - Get Number Multi Cast Message Sent in Speficy Date');
  console.log(date)
  return Get('https://api.line.me/v2/bot/message/delivery/multicast', {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    params: date,
  }).then( (res) => JSON.parse(res.body));
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "status":"ready",
//   "success":10000
// }

module.exports.getNumberBroadCastMessageSent = (date, ACCESS_TOKEN) => {
  logGreen('Line Service - Get Number Multi Cast Message Sent in Speficy Date');
  console.log(date)
  return Get('https://api.line.me/v2/bot/message/delivery/broadcast', {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
    params: date,
  }).then( (res) => JSON.parse(res.body));
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "status":"ready",
//   "success":10000
// }

module.exports.getProfile = (userId, ACCESS_TOKEN) => {
  logGreen('Line Service - Get Profile');
  console.log('UserId => ' + userId);
  return Get(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      ['Authorization']: `Bearer ${ACCESS_TOKEN}`,
    },
  }).then( (res) => JSON.parse(res.body))
};
// Returns the status code 200 and a JSON object with the following information.
// {
//   "displayName":"LINE taro",
//   "userId":"U4af4980629...",
//   "pictureUrl":"https://obs.line-apps.com/...",
//   "statusMessage":"Hello, LINE!"
// }
