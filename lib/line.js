const Crypto = require('crypto');

module.exports.checkRequestIsValid = (request, LINE_CHANNEL_SECRET) => {
  const signature = request.headers['x-line-signature'];
  const payload = request.payload;
  if ( signature 
    === Crypto.createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(JSON.stringify(payload))
    .digest('base64') ) return true;
  return false;
};