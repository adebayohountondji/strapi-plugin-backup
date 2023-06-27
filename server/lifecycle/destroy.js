const fs = require('fs');

const {
  tmpDir
} = require('../../lib/utils');

module.exports = () => ({
  destroy({ strapi }) {
    if (fs.existsSync(tmpDir())) {
      fs.rmdirSync(tmpDir());
    }

    strapi.plugin('backup')
      .service('log')
      .info('destroy');
  }
});
