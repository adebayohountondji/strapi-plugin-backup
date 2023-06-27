const fs = require('fs');

const cron = require('../configuration/cron');

const {
  tmpDir
} = require('../../lib/utils');

module.exports = async ({ strapi }) => {
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
