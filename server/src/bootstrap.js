const fs = require('fs');

const cron = require('./config/cron');

const {
  tmpDir
} = require('./lib/utils');

module.exports = async ({ strapi }) => {
  console.log("hello world")
  if (!fs.existsSync(tmpDir())) {
    fs.mkdirSync(tmpDir());
  }

  strapi.cron.add(
    cron({ strapi })
  );

  strapi.plugin('backup')
    .service('log')
    .info('bootstrap');
};