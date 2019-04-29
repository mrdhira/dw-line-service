const request = require('request');
const Promise = require('bluebird');
const Get = Promise.promisify(request.get);
const Post = Promise.promisify(request.post);
const Put = Promise.promisify(request.put);
const { logGreen } = require('../../lib/console');
const { logbook } = require('../../config/line');
const { LOGBOOK_API } = logbook;

module.exports.findUserByLineId = (line_id) => {
  logGreen('Logbook Service - Find User By Line Id...');
  return Get(`${LOGBOOK_API}/user/${line_id}`)
};

module.exports.findAllUser = () => {
  logGreen('Logbook Service - Find All User...');
  return Get(`${LOGBOOK_API}/user`)
};

module.exports.createUser = (line_id, full_name) => {
  logGreen('Logbook Service - Create User...');
  const form = { line_id, full_name };
  return Post(`${LOGBOOK_API}/createUser`, { form });
};

module.exports.updateCookie = (line_id, cookie) => {
  logGreen('Logbook Service - Update Cookie...');
  const form = { line_id, cookie };
  return Put(`${LOGBOOK_API}/updateCookie`, { form });
};

module.exports.updateName = (line_id, full_name) => {
  logGreen('Logbook Service - Update Name...');
  const form = { line_id, full_name };
  return Put(`${LOGBOOK_API}/updateName`, { form });
};

module.exports.loginLogbook = (username, password) => {
  logGreen('Logbook Service - Login Logbook...');
  const form = { username, password };
  return Post(`${LOGBOOK_API}/login`, { form });
};

module.exports.checkLogbook = (cookie) => {
  logGreen('Logbook Service - Check Logbook...');
  const form = { cookie };
  return Post(`${LOGBOOK_API}/checkLogbook`, { form });
};

module.exports.insertLogbook = (cookie, clock_in, clock_out, activity, description) => {
  logGreen('Logbook Service - Insert Logbook...');
  const form = { cookie, clock_in, clock_out, activity, description };
  return Post(`${LOGBOOK_API}/insertLogbook`, { form });
};

module.exports.updateUserOption = (line_id, option, value) => {
  logGreen('Logbook Service - Update User Option...');
  const form = {line_id, option, value};
  return Put(`${LOGBOOK_API}/updateUserOption`, { form });
};