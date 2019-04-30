const Moment = require('moment-timezone');
const lineService = require('../services/line')
const logbookService = require('../services/logbook')
const { checkRequestIsValid } = require('../../lib/line');
const {
  logRed,
  logGreen,
  logBlue,
  statusMessage,
} = require('../../lib/console');
const {
  admin,
  logbook,
} = require('../../config/line');
const {
  LINE_CHANNEL_ID: ID,
  LINE_CHANNEL_SECRET: SECRET,
  LINE_CHANNEL_ACCESS: ACCESS_TOKEN,
} = logbook;

// ===== FOLLOW ===== //
// FOLLOW HANDLER
const followHandler = (event) => {
  logGreen('Logbook Controller - Follow Handler...');
  const { replyToken, timestamp, source} = event;
  const { type, userId } = source;
  switch (type) {
    case 'user':
      return userFollowHandler(replyToken, userId);
    default:
      return followErrorHandler(event);
  };
}
// FOLLOW ERROR HANDLER
const followErrorHandler = (event) => {
  logRed('Logbook Controller - Follow Error Handler...');
  return statusMessage(500, 'Something wrong!', true);
};
// USER FOLLOW HANDLER
const userFollowHandler = async (replyToken, userId) => {
  logGreen('Logbook Controller - User Follow Handler...');
  const line_profile = await lineService.getProfile(userId, ACCESS_TOKEN);
  return Promise.all([
    logbookService.createUser(userId, line_profile.displayName),
    logbookService.updateUserOption(userId, 'isFollow', 1),
  ])
  .then(([user, isFollow]) => {
    if (!user || !isFollow) {
      logRed('ERROR! - User Follow Handler');
      console.log({userId, displayName: line_profile.displayName, isFollow: 1});
      return statusMessage(500, 'Something wrong!', true);
    } else {
      const replyMessage = {
        type: 'text',
        text: `Halo kak ${line_profile.displayName}, untuk panduan menggunakan bot ini silahkan mengirimkan /help.`,
      };
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    };
  })
};
// UNFFOLLOW HANDLER
const unfollowHandler = (event) => {
  logGreen('Logbook Controller - Unfollow Handler...');
  const { replyToken, timestamp, source} = event;
  const { type, userId } = source;
  return logbookService.updateUserOption(userId, 'isFollow', 0);
};

// ===== MESSAGE ===== //
// ===== TEXT ===== //
// TEXT HANDLER
const textHandler = (event) => {
  logGreen('Logbook Controller - Text Handler...');
  const arrText = event.message.text.split(' ');
  const command = arrText[0].split(/\n/);
  switch (command[0].toLowerCase()) {
    case '/help':
      return helpTextHandler(event);
    case '/login':
      return loginTextHandler(event);
    case '/logout':
      return logoutTextHandler(event);
    case '/check':
      return checkTextHandler(event);
    case '/insert':
      return insertTextHandler(event);
    case '/admin':
      return adminTextHandler(event);
    case '/isdailyreminder':
      return isDailyReminderTextHandler(event);
    case '/isautofillweekend':
      return isAutoFillWeekEndTextHandler(event);
    case '/send':
      return sendTextHandler(event);
    case '/blast':
      return blastTextHandler(event);
    default:
      return textErrorHandler(event);
  };
};
// TEXT ERROR HANDLER
const textErrorHandler = (event) => {
  logRed('Logbook Controller - Text Error Handler...');
  const { replyToken } = event;
  const replyMessage = {
    type: 'text',
    text: 'Maaf kak, kayaknya DITA belum paham itu deh.',
  };
  const form = { replyToken, messages: [replyMessage] };
  return lineService.replyMessage(form, ACCESS_TOKEN);
};
// /HELP
const helpTextHandler = (event) => {
  logGreen('Logbook Controller - Help Text Handler...');
  const { replyToken } = event;
  const replyMessage = {
    type: 'text',
    text: 'DITA command list:\n'
    + '- Login ke dalam logbook (tenang username dan password tidak akan tersave):\n'
    + '/login username password\n\n'
    + '- Logout dari logbook:\n'
    + '/logout\n\n'
    + '- Cek status pengisian logbook kalian:\n'
    + '/check\n\n'
    + '- Mengisi logbook harian:\n'
    + '/insert\nclock-in\nclock-out\nactivity\ndescripti\n\n'
    + '- Mengubah settingan daily reminder:\n'
    + '/isdailyreminder [on/off]\n\n'
    + '- Mengubah settingal auto fill weekend:\n'
    + '/isautofillweekend [on/off]\n\n'
    + '- Mau chat DITA?^^ bisa menggunakan command di bawah ini, maaf ya kalau DITA lama balasnya hehehe\n'
    + '/admin [isi chatnya disini, jangan curhat ya hehehe]\n\n'
    + 'Semoga membantu^^ jangan sungkan buat chat DITA.'
  };
  const form = { replyToken, messages: [replyMessage] };
  return lineService.replyMessage(form, ACCESS_TOKEN);
};
/**
 * /LOGIN
 * @type {func}
 * @username {integer}
 * @password {string}
 */
const loginTextHandler = (event) => {
  logGreen('Logbook Controller - Login Text Handler...');
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(' ');
  if (arrText.length != 3) {
    const replyMessage = {
      type: 'text',
      text: 'Format login salah, yuk benerin kak formatnya kayak gini => /login username password',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    const username = arrText[1];
    const password = arrText[2];
    return logbookService.loginLogbook(username, password)
    .then( (res) => JSON.parse(res.body))
    .then( (login) => {
      if (login.statusCode != 200) {
        logRed('==WARNING!!!==');
        logRed('LOGIN LOGBOOK FAILED');
        console.log(login);
        const replyMessage = {
          type: 'text',
          text: 'Wah terjadi sedikit gangguan, silahkan melapor ke /admin [isi laporan]',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        return logbookService.updateCookie(source.userId, login.data.cookie)
        .then((res) => JSON.parse(res.body))
        .then((updateCookie) => {
          if (updateCookie.statusCode != 200) {
            logRed('==WARNING!!!==');
            logRed('UPDATE COOKIE FAILED');
            logRed(updateCookie);
            const replyMessage = {
              type: 'text',
              text: 'Wah terjadi sedikit gangguan, silahkan melapor ke /admin [isi laporan]',
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          } else {
            const replyMessage = {
              type: 'text',
              text: login.message,
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          };
        }).catch( (err) => statusMessage(500, err.message, true));
      };
    }).catch( (err) => statusMessage(500, err.message, true));
  };
};
// /LOGOUT
const logoutTextHandler = async (event) => {
  logGreen('Logbook Controller - Logout Text Handler...');
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(' ');
  if (arrText.length != 1) {
    const replyMessage = {
      type: 'text',
      text: 'Format logout salah, yuk benerin formatnya kayak gini => /logout',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    return logbookService.findUserByLineId(source.userId)
    .then( (res) => JSON.parse(res.body))
    .then( (user) => {
      if (!user.data.cookie) {
        const replyMessage = {
          type: 'text',
          text: 'Kamu belom login mana bisa logout.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        return logbookService.updateCookie(source.userId, cookie=null)
        .then((res) => JSON.parse(res.body))
        .then((updateCookie) => {
          if (updateCookie.statusCode != 200) {
            logRed('==WARNING!!!==');
            logRed('UPDATE COOKIE FAILED');
            logRed(updateCookie);
            const replyMessage = {
              type: 'text',
              text: 'Wah terjadi sedikit gangguan, silahkan melapor ke /admin [isi laporan]',
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          }
          const replyMessage = {
            type: 'text',
            text: 'Kamu berhasil logout.'
          };
          const form = { replyToken, messages: [replyMessage] };
          return lineService.replyMessage(form, ACCESS_TOKEN);
        }).catch((err) => statusMessage(500, err.message, true));
      };
    }).catch((err) => statusMessage(500, err.message, true));
  };
};
// /CHECK
const checkTextHandler = (event) => {
  logGreen('Logbook Controller - Check Text Handler');
  logGreen('LOGBOOK - MESSAGE - CHECK LOGBOOK TEXT HANDLER');
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(' ');
  if (arrText.length != 1) {
    const replyMessage = {
      type: 'text',
      text: 'Format logout salah, yuk benerin formatnya kayak gini => /check',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    return logbookService.findUserByLineId(source.userId)
    .then( (res) => JSON.parse(res.body))
    .then( (user) => {
      if (!user.data.cookie) {
        const replyMessage = {
          type: 'text',
          text: 'Kamu belom login, login dulu ya kak disini => /login username password',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        return logbookService.checkLogbook(user.data.cookie)
        .then( (res) => JSON.parse(res.body))
        .then( (check) => {
          if (check.statusCode != 200) {
            logRed('==WARNING!!!==');
            logRed('CHECK LOGBOOK FAILED');
            console.log(check);
            const replyMessage = {
              type: 'text',
              text: 'Wah terjadi sedikit gangguan, silahkan melapor ke /admin [isi laporan]',
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          } else {
            let message = check.message;
            if (check.data && check.data.logbookDetail) message = message + '\n' + check.data.logbookDetail;
            const replyMessage = {
              type: 'text',
              text: message,
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          }
        }).catch((err) => statusMessage(500, err.message, true));
      };
    }).catch((err) => statusMessage(500, err.message, true));
  };
};
/**
 * /INSERT
 * @type {func}
 * @clock_in {string}
 * @clock_out {string}
 * @activity {string}
 * @description {string}
 */
const insertTextHandler = (event) => {
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(/\n/);
  if (arrText.length != 5) {
    const replyMessage = {
      type: 'text',
      text: 'Format insert logbook salah, yuk benerin formatnya kayak gini => /insert\nclock-in\nclock-out\nactivity\ndescription',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    return logbookService.findUserByLineId(source.userId)
    .then( (res) => JSON.parse(res.body))
    .then( (user) => {
      if (!user.data.cookie) {
        const replyMessage = {
          type: 'text',
          text: 'Hayoloh belum login ke learning plan ya... login dulu ya disini => /login username password',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        const clock_in = arrText[1];
        const clock_out = arrText[2];
        const activity = arrText[3];
        const description = arrText[4];
        return logbookService.insertLogbook(
          user.data.cookie,
          clock_in,
          clock_out,
          activity,
          description
        ).then( (res) => JSON.parse(res.body))
        .then( (insert) => {
          if (insert.statusCode != 200) {
            logRed('==WARNING!!!==');
            logRed('CHECK LOGBOOK FAILED!');
            logRed(insert);
            const replyMessage = {
              type: 'text',
              text: 'Wah terjadi sedikit gangguan, silahkan melapor ke /admin [isi laporan]',
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          } else {
            const replyMessage = {
              type: 'text',
              text: insert.message,
            };
            const form = { replyToken, messages: [replyMessage] };
            return lineService.replyMessage(form, ACCESS_TOKEN);
          };
        }).catch((err) => statusMessage(500, err.message, true));
      };
    }).catch((err) => statusMessage(500, err.message, true));
  };
};
/**
 * /ADMIN
 * @type {func}
 * @chat {text}
 */
const adminTextHandler = async (event) => {
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(' ');
  const msg = text.replace('/admin ', '');
  if (arrText.length < 2) {
    const replyMessage = {
      type: 'text',
      text: 'Wahh mau ngechat apa nih? kok gak ada isinya hehehe.',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    const replyMessage = {
      type: 'text',
      text: 'Ditunggu yaa, DITA hubungi ke adminya dulu.',
    };
    const pushMessageLineId = {
      type: 'text',
      text: source.userId,
    };
    const pushMessage = {
      type: 'text',
      text: `[${source.userId}]/${Moment(timestamp).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}:\n${msg}`,
    };
    const formReplyMessage = { replyToken, messages: [replyMessage] };
    await lineService.replyMessage(formReplyMessage, ACCESS_TOKEN);
    const formPushMessageLineId = { to:admin.ADMIN_LINE_ID, messages: [pushMessageLineId] };
    await lineService.pushMessage(formPushMessageLineId, ACCESS_TOKEN);
    const formPushMessage = { to:admin.ADMIN_LINE_ID, messages: [pushMessage] };
    return lineService.pushMessage(formPushMessage, ACCESS_TOKEN);
  };
};
 /**
  * /SEND
  * @type {func}
  * @userId {string}
  * @chat {text}
  */
const sendTextHandler = (event) => {
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(' ');
  if (source.userId != admin.ADMIN_LINE_ID) {
    const replyMessage = {
      type: 'text',
      text: 'Kamu bukan admin lho.',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else if (arrText.length < 3) {
    const replyMessage = {
      type: 'text',
      text: 'Kamu lupa formatnya ya kak dhira? formatnya kayak gini => /send line_id [isi chat]',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    const line_id_dest = arrText[1];
    arrText.splice(0,2);
    const pushMessage = {
      type: 'text',
      text: `[Admin]/${Moment(timestamp).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}: ${arrText.join(' ')}`,
    };
    const form = { to:line_id_dest, messages: [pushMessage] };
    return lineService.pushMessage(form, ACCESS_TOKEN);
  };
};
/**
 * /BLAST
 * @type {func}
 * @chat {text}
 */
const blastTextHandler = (event) => {
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const arrText = text.split(' ');
  const msg = text.replace('/blast', '');
  if (source.userId != admin.ADMIN_LINE_ID) {
    const replyMessage = {
      type: 'text',
      text: 'Kamu bukan admin lho.',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else if (arrText.length < 2) {
    const replyMessage = {
      type: 'text',
      text: 'Kamu lupa formatnya ya kak dhira? formatnya kayak gini => /blast [isi chat]',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else {
    const pushMessage = {
      type: 'text',
      text: `[Admin - Blast Message]/${Moment(timestamp).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}\n` + msg,
    };
    const form = { messages: [pushMessage] }
    return lineService.broadCastMessage( form, ACCESS_TOKEN );
  };
};
/**
 * /ISDAILYREMINDER
 * @type {func}
 * @on / @off {string}
 */

const isDailyReminderTextHandler = async (event) => {
  logGreen('Logbook Controller - isDailyReminderTextHandler Text Handler...')
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const { userId } = source;
  const user = ( JSON.parse( ( await logbookService.findUserByLineId(userId) ).body ) ).data;
  const arrText = text.split(' ');
  if (arrText.length > 2) {
    const replyMessage = {
      type: 'text',
      text: 'Formatnya salah kak, yuk benerin kak formatnya kayak gini /isdailyreminder [on/off]',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else if (arrText.length != 1) {
    if (arrText[1] == 'off') {
      if (user.isDailyReminder == 0 || user.isDailyReminder == null) {
        const replyMessage = {
          type: 'text',
          text: 'Kamu memang sudah menonaktifkan fitur daily reminder kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        const replyMessage = {
          type: 'text',
          text: 'Kamu berhasil menonaktifkan fitur daily reminder kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return Promise.all([
          logbookService.updateUserOption(userId, 'isDailyReminder', 0),
          lineService.replyMessage(form, ACCESS_TOKEN),
        ]).catch( (err) => statusMessage(500, err.message, true));
      };
    } else if (arrText[1] == 'on') {
      if (user.isDailyReminder == 1) {
        const replyMessage = {
          type: 'text',
          text: 'Kamu memang sudah mengaktifkan fitur daily reminder kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        const replyMessage = {
          type: 'text',
          text: 'Kamu berhasil mengaktifkan fitur daily reminder kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return Promise.all([
          logbookService.updateUserOption(userId, 'isDailyReminder', 1),
          lineService.replyMessage(form, ACCESS_TOKEN),
        ]).catch( (err) => statusMessage(500, err.message, true));
      };
    } else {
      const replyMessage = {
        type: 'text',
        text: 'Formatnya salah kak, yuk benerin kak formatnya kayak gini /isdailyreminder [on/off]',
      };
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    };
  } else {
    if (user.isDailyReminder == 0 || user.isDailyReminder == null) {
      const replyMessage = {
        type: 'text',
        text: 'Status daily reminder kamu adalah tidak aktif.',
      }
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    } else if (user.isDailyReminder == 1) {
      const replyMessage = {
        type: 'text',
        text: 'Status daily reminder kamu adalah aktif.',
      }
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    };
  };
};
 /**
 * /ISAUTOFILLWEEKEND
 * @type {func}
 * @on / @off {string}
 */
const isAutoFillWeekEndTextHandler = async (event) => {
  logGreen('Logbook Controller - isAutoFillWeekEnd Text Handler...')
  const { replyToken, source, timestamp, message } = event;
  const { type, id, text } = message;
  const { userId } = source;
  const user = ( JSON.parse( ( await logbookService.findUserByLineId(userId) ).body ) ).data;
  const arrText = text.split(' ');
  if (arrText.length > 2) {
    const replyMessage = {
      type: 'text',
      text: 'Formatnya salah kak, yuk benerin kak formatnya kayak gini /isautofillweekend [on/off]',
    };
    const form = { replyToken, messages: [replyMessage] };
    return lineService.replyMessage(form, ACCESS_TOKEN);
  } else if (arrText.length != 1) {
    if (arrText[1] == 'off') {
      if (user.isAutoFillWeekend == 0 || user.isAutoFillWeekend == null) {
        const replyMessage = {
          type: 'text',
          text: 'Kamu memang sudah menonaktifkan fitur auto fill weekend kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        const replyMessage = {
          type: 'text',
          text: 'Kamu berhasil menonaktifkan fitur auto fill weekend kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return Promise.all([
          logbookService.updateUserOption(userId, 'isAutoFillWeekend', 0),
          lineService.replyMessage(form, ACCESS_TOKEN),
        ]).catch( (err) => statusMessage(500, err.message, true));
      };
    } else if (arrText[1] == 'on') {
      if (user.isAutoFillWeekend == 1) {
        const replyMessage = {
          type: 'text',
          text: 'Kamu memang sudah mengaktifkan fitur auto fill weekend kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return lineService.replyMessage(form, ACCESS_TOKEN);
      } else {
        const replyMessage = {
          type: 'text',
          text: 'Kamu berhasil mengaktifkan fitur auto fill weekend kamu.',
        };
        const form = { replyToken, messages: [replyMessage] };
        return Promise.all([
          logbookService.updateUserOption(userId, 'isAutoFillWeekend', 1),
          lineService.replyMessage(form, ACCESS_TOKEN),
        ]).catch( (err) => statusMessage(500, err.message, true));
      };
    } else {
      const replyMessage = {
        type: 'text',
        text: 'Formatnya salah kak, yuk benerin kak formatnya kayak gini /isautofillweekend [on/off]',
      };
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    };
  } else {
    if (user.isAutoFillWeekend == 0 || user.isAutoFillWeekend == null) {
      const replyMessage = {
        type: 'text',
        text: 'Status auto fill weekend kamu adalah tidak aktif.',
      }
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    } else if (user.isAutoFillWeekend == 1) {
      const replyMessage = {
        type: 'text',
        text: 'Status auto fill weekend kamu adalah aktif.',
      }
      const form = { replyToken, messages: [replyMessage] };
      return lineService.replyMessage(form, ACCESS_TOKEN);
    };
  };
};
// ===== WEBHOOK ===== //
// ===== EVENT ===== //
// EVENT HANDLER
module.exports.webhook = async (request, h) => {
  logGreen('Logbook Controller - Webhook');
  console.log(request.payload.events);
  try {
    // Check if request from line
    const validRequest = await checkRequestIsValid(request, SECRET);
    if (!validRequest) return statusMessage(404, 'You\'re not from line.', true);

    const event = request.payload.events[0];
    const event_type = event.type;
    switch (event_type) {
      case 'follow':
       return followHandler(event);
      case 'unfollow':
        return unfollowHandler(event);
      case 'message':
        return textHandler(event);
      default:
        return eventErrorHandler(event);
    };
  } catch(err) {
    return statusMessage(500, 'Something wrong!', true);
  };
};

// EVENT ERROR HANDLER
const eventErrorHandler = (event) => {
  logRed('Logbook Controller - Evenr Error Handler...');
  return statusMessage(500, 'Something wrong!', true);
};
