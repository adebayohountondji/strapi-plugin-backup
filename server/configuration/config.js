'use strict';

const {
  StrapiDatabaseDriver
} = require('../../lib/db-dump');

const {
  StorageService
} = require('../../lib/storage');

const requiredConfigKeys = [
  'awsAccessKeyId',
  'awsSecretAccessKey',
  'awsRegion',
  'awsS3Bucket',
  'cronSchedule',
  'databaseDriver',
  'gcsBucketName',
  'gcsKeyFilename',
  'mysqldumpExecutable',
  'pgDumpExecutable',
  'sqlite3Executable',
  'storageService',
  'timeToKeepBackupsInSeconds'
];

const customValidatorByRequiredConfigKey = {
  awsAccessKeyId: (config) => {
    if (config.storageService !== StorageService.AWS_S3) {
      return true;
    }

    return typeof config.awsAccessKeyId === 'string';
  },
  awsSecretAccessKey: (config) => {
    if (config.storageService !== StorageService.AWS_S3) {
      return true;
    }

    return typeof config.awsSecretAccessKey === 'string';
  },
  awsRegion: (config) => {
    if (config.storageService !== StorageService.AWS_S3) {
      return true;
    }

    return typeof config.awsRegion === 'string';
  },
  awsS3Bucket: (config) => {
    if (config.storageService !== StorageService.AWS_S3) {
      return true;
    }

    return typeof config.awsS3Bucket === 'string';
  },
  databaseDriver: (config) => Object.values(StrapiDatabaseDriver).includes(config.databaseDriver),
  gcsBucketName: (config) => {
    if (config.storageService !== StorageService.GCS) {
      return true;
    }

    return typeof config.gcsBucketName === 'string';
  },
  gcsKeyFilename: (config) => {
    if (config.storageService !== StorageService.GCS) {
      return true;
    }

    return typeof config.gcsKeyFilename === 'string';
  },
  mysqldumpExecutable: (config) => {
    if (config.disableDatabaseBackup || config.databaseDriver !== StrapiDatabaseDriver.MYSQL) {
      return true;
    }

    return typeof config.mysqldumpExecutable === 'string';
  },
  pgDumpExecutable: (config) => {
    if (config.disableDatabaseBackup || config.databaseDriver !== StrapiDatabaseDriver.POSTGRES) {
      return true;
    }

    return typeof config.pgDumpExecutable === 'string';
  },
  sqlite3Executable: (config) => {
    if (config.disableDatabaseBackup || config.databaseDriver !== StrapiDatabaseDriver.SQLITE) {
      return true;
    }

    return typeof config.sqlite3Executable === 'string';
  },
  storageService: (config) => Object.values(StorageService).includes(config.storageService),
  timeToKeepBackupsInSeconds: (config) => {
    if (config.cleanup !== true) {
      return true;
    }

    return typeof config.timeToKeepBackupsInSeconds === 'number';
  }
}

module.exports = {
  default: ({ env }) => ({
    disableUploadsBackup: false,
    disableDatabaseBackup: false,
    databaseDriver: env('DATABASE_CLIENT'),
    mysqldumpOptions: [],
    pgDumpOptions: [],
    allowCleanup: false,
    timeToKeepBackupsInSeconds: undefined,
    cleanupCronSchedule: undefined,
    customDatabaseBackupFilename: undefined,
    customUploadsBackupFilename: undefined
  }),

  validator: (config) => {
    requiredConfigKeys.forEach(configKey => {
      const configKeyValueIsValid = customValidatorByRequiredConfigKey[configKey]
        ? customValidatorByRequiredConfigKey[configKey](config)
        : config[configKey] !== undefined
        ;

      if (!configKeyValueIsValid) {
        throw new Error(
          `“${config[configKey]}“ is not a valid strapi-plugin-backup config “${configKey}“ value.`
        );
      }
    });
  }
}
