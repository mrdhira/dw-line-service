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
const name = 'AUTOMATIC FILL LOGBOOK WEEKEND!';

/**
 * Rule definition for job scheduling (in UTC)
 * @type {cron} seconds rule supported
 */
const rule = '0 0 12 * * 0,6';
const tz = 'Asia/Jakarta';

const getAllUser = () => {
  return logbookService.findAllUser()
  .then( (res) => JSON.parse(res.body))
  .then( (user) => user.data )
}

/**
 * The job that will be run
 * @type {func}
 */
const job = async () => {
  console.log(`CRON ${name} is running...`);
  const fill = 'OFF';
  const userList = await getAllUser().filter((user) => user.isAutoFillWeekend == 1);
  return Promise.mapSeries(userList, async (user) => {
    const checkLogbook = JSON.parse( ( await logbookService.checkLogbook(user.cookie) ).body );
    const check = checkLogbook.message;
    if (check.match(/You haven't filled activity on/)) {
      // if (user.line_id == 'Ubeea52ef11660484b2498097ed881012') {
      const dateNow = Moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss');      
      return logbookService.insertLogbook(
        user.cookie,
        fill,
        fill,
        fill,
        fill,
      ).then( (res) => JSON.parse(res.body))
      .then( (insert) => {
        if (insert.statusCode != 200) {
          console.log('==WARNING!!!==');
          console.log('INSERT LOGBOOK FAILED!');
          console.log(insert);
          const pushMessage = {
            type: 'text',
            text: `[ADMIN - AUTO FILL WEEKEND LOGBOOK] - ${dateNow}\n`
              + `${user.full_name} pengisian automasi logbook kamu gagal, segera hubungi admin!`,
          };
          console.log(`Sending a auto fill logbook [failed] to: ${user.full_name}`);
          return lineService.pushMessage(user.line_id, pushMessage, ACCESS, SECRET);
        } else {
          const pushMessage = {
            type: 'text',
            text: `[ADMIN - AUTO FILL WEEKEND LOGBOOK] - ${dateNow}\n`
              + `${user.full_name} pengisian automasi logbookmu berhasil, selamat berakhir pekan^^`,
          }
          const form = { to:user.line_id, messages: [pushMessage] };
          console.log(`Sending a auto fill logbook [success] to: ${user.full_name}`);
          return lineService.pushMessage(form, ACCESS);
        }
      })
    }
  })
};

module.exports = {
  name,
  enable: true /* Simple switch to enable/disable jobs */,
  cronjob: { rule, job, tz }, /* export cronjob parts */
};
  