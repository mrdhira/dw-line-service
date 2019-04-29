/* This module is to be run once after server is ready */
const CronJob = require('cron').CronJob;
const fs = require('fs');
const jobs = [];

/**
 * Collates all cron jobs into one array
 */
fs.readdirSync(__dirname).forEach((dir) => {
  if (dir !== 'index.js') {
    fs.readdirSync(`${__dirname}/${dir}`).forEach((file) => {
      const moduleName = file.split('.')[0];
      jobs.push(
        Object.assign(require(`./${dir}/${moduleName}`), { type: dir })
      );
    });
  }
});

/**
 * Cron runner function. Will execute all jobs that is specified as { enable: true }
 * @return {boolean[]} node-schedule's indication on whether a job has run successfully
 */
module.exports.start = () => {
  return jobs
    .filter((j) => j.enable)
    .map((j) => {
      console.log(`CRON: Starting job ${j.type}/${j.name}`);
      return new CronJob(
        j.cronjob.rule,
        j.cronjob.job,
        null,
        true,
        j.cronjob.tz
      );
    });
};

module.exports.runJobs = (...execJobs) => {
  if (!process.env.ENABLE_CRON) {
    console.error(`Only run this function from cron-specified node.`);
    process.exit(1);
  }
  if (execJobs.length === 0) {
    console.error(`Not enough parameters.
    Usage: npm run cron:once -- job1 job2 etc..`);
    process.exit(1);
  }
  return jobs.forEach((j) => {
    if (execJobs.includes(j.name)) {
      console.log(`Manually running cron script ${j.name}`);
      j.cronjob.job();
    }
  });
};
