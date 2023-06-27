const {
  parseMysqlConnectionString,
  parsePostgresConnectionString,
  StrapiDatabaseDriver
} = require('../../../lib/db-dump');

const createArchiveRootNameFromDate = (date) => {
  const _date = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ].join('');

  const time = [
    date.getHours(),
    date.getMonth(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ].join('');

  return `${_date}-${time}`;
};

const createBackupFilenameFromPrefixAndDate = (prefix, date) => {
  return `${prefix}-${createArchiveRootNameFromDate(date)}`;
};

const getDefaultBackupDatabaseConfigFromStrapiDbConnectionConfig = (strapiDbConnectionConfig) => ({
  user: strapiDbConnectionConfig.connection.user,
  password: strapiDbConnectionConfig.connection.password,
  host: strapiDbConnectionConfig.connection.host,
  port: strapiDbConnectionConfig.connection.port,
  database: strapiDbConnectionConfig.connection.database
});

const getBackupMysqlConfigFromStrapiDbConnectionConfig = (strapiDbConnectionConfig) => {
  if (strapiDbConnectionConfig.connection.connectionString) {
    return parseMysqlConnectionString(strapiDbConnectionConfig.connection.connectionString);
  }

  return getDefaultBackupDatabaseConfigFromStrapiDbConnectionConfig(strapiDbConnectionConfig);
}

const getBackupPostgresConfigFromStrapiDbConfig = (strapiDbConnectionConfig) => {
  if (strapiDbConnectionConfig.connection.connectionString) {
    return parsePostgresConnectionString(strapiDbConnectionConfig.connection.connectionString);
  }

  return getDefaultBackupDatabaseConfigFromStrapiDbConnectionConfig(strapiDbConnectionConfig);
}

const createBackupDatabaseConnectionConfigFromStrapi = (strapi) => {
  let connection = {};

  const strapiDbConnectionConfig = strapi.db.config.connection;

  switch (strapiDbConnectionConfig.client) {
    case StrapiDatabaseDriver.MYSQL:
      connection = getBackupMysqlConfigFromStrapiDbConnectionConfig(strapiDbConnectionConfig);
      break;
    case StrapiDatabaseDriver.POSTGRES:
      connection = getBackupPostgresConfigFromStrapiDbConfig(strapiDbConnectionConfig);
      break;
    case StrapiDatabaseDriver.SQLITE:
      connection = {
        filename: strapiDbConnectionConfig.connection.filename
      };
      break;
    default:
      throw new Error(
        `“${strapiDbConnectionConfig.client}“ is not a valid strapi-plugin-backup config “databaseDriver“ value.`
        + ` Available values are : ${Object.values(StrapiDatabaseDriver).join(', ')}.`
      );
  }

  return {
    ...connection,
    databaseDriver: strapiDbConnectionConfig.client
  }
};

module.exports = {
  createBackupDatabaseConnectionConfigFromStrapi,
  createBackupFilenameFromPrefixAndDate
}
