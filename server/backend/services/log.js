module.exports = ({strapi}) => ({

  error: (message) => {
    strapi.log.error(`strapi-plugin-backup: ${message}`);
  },

  info: (message) => {
    strapi.log.info(`strapi-plugin-backup: ${message}`);
  },

})
