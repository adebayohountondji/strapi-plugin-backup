module.exports = ({ strapi }) => ({

  info: (message) => {
    strapi.log.info(`strapi-plugin-backup: ${message}`);
  }

})
