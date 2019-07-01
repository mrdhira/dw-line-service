require('dotenv').config();
const Promise = require('bluebird');
const Moment = require('moment-timezone');
const logbookService = require('../../../services/logbook');
const lineService = require('../../../services/line');
const { logbook } = require('../../../../config/line');
const {
  LINE_CHANNEL_ACCESS: ACCESS,
} = logbook;

/**
 * Cron job name
 * @type {string}
 */
const name = 'DAILY REMINDER FOR LOGBOOK!';

/**
 * Rule definition for job scheduling (in UTC)
 * @type {cron} seconds rule supported
 */
const rule = '0 0,30 19,20,21,22,23 * * *';
const tz = 'Asia/Jakarta';

const getAllUser = () => {
  return logbookService.findAllUser()
  .then( (res) => JSON.parse(res.body))
  .then( (user) => user.data )
}

const setUser = async (users) => {
  const userList = [];
  let counter = 0;
  await Promise.mapSeries((users), async (user) => {
    counter++;
    const checkLogbook = JSON.parse(
      (
        await logbookService.checkLogbook(user.cookie)
      )
      .body
    );
    const check = checkLogbook.message;
    if (check.match(/You haven't filled activity on/)) {
      console.log(counter);
      console.log(user.line_id);
      await userList.push(user.line_id);
    }
  });
  return userList;
};

/**
 * The job that will be run 
 * @type {func}
 */
const job = async () => {
  console.log(`CRON ${name} is running...`);
  const users = await getAllUser().filter((user) => user.isDailyReminder == 1);
  const userList = await setUser(users);
  const dateNow = await Moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss');      
  const pushMessage = {
    type: 'text',
    text: `[ADMIN - DAILY REMINDER] - ${dateNow}\n`
      + `Kak jangan lupa isi logbook ya^^`,
  };
  const form = { to: userList, messages: [pushMessage] };
  console.log(form);
  return lineService.multiCastMessage(form, ACCESS)
    .catch((error) => {
      console.log(error);
    })
};

module.exports = {
  name,
  enable: true /* Simple switch to enable/disable jobs */,
  cronjob: { rule, job, tz }, /* export cronjob parts */
};
