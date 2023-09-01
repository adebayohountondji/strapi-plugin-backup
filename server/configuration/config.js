'use strict';

const {
  StrapiDatabaseDriver
} = require("../../internal/db-dump");

const {
  StorageService
} = require("../../internal/storage");

const throwConfigInvalidValueError = (configKey, invalidValue) => {
  throw new Error(
    `“${invalidValue}“ is not a valid strapi-plugin-backup config “${configKey}“ value.`
  );
}

const requiredConfigKeys = [
  'awsAccessKeyId',
  'awsSecretAccessKey',
  'awsRegion',
  'awsS3Endpoint',
  'awsS3Bucket',
  'azureStorageAccountKey',
  'azureStorageAccountName',
  'azureStorageContainerName',
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

const configStorageServiceIsAwsS3 = config => config.storageService === StorageService.AWS_S3;
const configStorageServiceIsAzureBlobStorage = config => config.storageService === StorageService.AZURE_BLOB_STORAGE;
const configStorageServiceIsGCS = config => config.storageService === StorageService.GCS;

const customValidatorByRequiredConfigKey = {
  awsAccessKeyId: (config) => {
    if (!configStorageServiceIsAwsS3(config))
      return;

    if (typeof config.awsAccessKeyId !== 'string') {
      throwConfigInvalidValueError('awsAccessKeyId', config.awsAccessKeyId);
    }
  },
  awsSecretAccessKey: (config) => {
    if (!configStorageServiceIsAwsS3(config))
      return;

    if (typeof config.awsSecretAccessKey !== 'string') {
      throwConfigInvalidValueError('awsSecretAccessKey', config.awsSecretAccessKey);
    }
  },
  awsRegion: (config) => {
    if (!configStorageServiceIsAwsS3(config))
      return;

    if (config.awsS3Endpoint !== undefined)
      return;

    if (typeof config.awsRegion !== 'string') {
      throwConfigInvalidValueError('awsRegion', config.awsRegion);
    }
  },
  awsS3Endpoint: (config) => {
    if (!configStorageServiceIsAwsS3(config))
      return;

    if (config.awsRegion !== undefined)
      return;

    if (typeof config.awsS3Endpoint !== 'string') {
      throwConfigInvalidValueError('awsS3Endpoint', config.awsS3Endpoint);
    }
  },
  awsS3Bucket: (config) => {
    if (!configStorageServiceIsAwsS3(config))
      return;

    if (typeof config.awsS3Bucket !== 'string') {
      throwConfigInvalidValueError('awsS3Bucket', config.awsS3Bucket);
    }
  },
  azureStorageAccountKey: (config) => {
    if (!configStorageServiceIsAzureBlobStorage(config))
      return;

    if (typeof config.azureStorageAccountKey !== 'string') {
      throwConfigInvalidValueError('azureStorageAccountKey', config.azureStorageAccountKey);
    }
  },
  azureStorageAccountName: (config) => {
    if (!configStorageServiceIsAzureBlobStorage(config))
      return;

    if (typeof config.azureStorageAccountName !== 'string') {
      throwConfigInvalidValueError('azureStorageAccountName', config.azureStorageAccountName);
    }
  },
  azureStorageContainerName: (config) => {
    if (!configStorageServiceIsAzureBlobStorage(config))
      return;

    if (typeof config.azureStorageContainerName !== 'string') {
      throwConfigInvalidValueError('azureStorageContainerName', config.azureStorageContainerName);
    }
  },
  databaseDriver: (config) => {
    if (!Object.values(StrapiDatabaseDriver).includes(config.databaseDriver)) {
      throwConfigInvalidValueError('databaseDriver', config.databaseDriver);
    }
  },
  gcsBucketName: (config) => {
    if (!configStorageServiceIsGCS(config))
      return;

    if (typeof config.gcsBucketName !== 'string') {
      throwConfigInvalidValueError('gcsBucketName', config.databaseDriver);
    }
  },
  gcsKeyFilename: (config) => {
    if (!configStorageServiceIsGCS(config))
      return;

    if (typeof config.gcsKeyFilename !== 'string') {
      throwConfigInvalidValueError('gcsKeyFilename', config.gcsKeyFilename);
    }
  },
  mysqldumpExecutable: (config) => {
    if (config.disableDatabaseBackup || config.databaseDriver !== StrapiDatabaseDriver.MYSQL)
      return;

    if (typeof config.mysqldumpExecutable !== 'string') {
      // @todo check if path exists
      throwConfigInvalidValueError('mysqldumpExecutable', config.mysqldumpExecutable);
    }
  },
  pgDumpExecutable: (config) => {
    if (config.disableDatabaseBackup || config.databaseDriver !== StrapiDatabaseDriver.POSTGRES)
      return;

    if (typeof config.pgDumpExecutable !== 'string') {
      // @todo check if path exists
      throwConfigInvalidValueError('pgDumpExecutable', config.pgDumpExecutable);
    }
  },
  sqlite3Executable: (config) => {
    if (config.disableDatabaseBackup || config.databaseDriver !== StrapiDatabaseDriver.SQLITE)
      return;

    if (typeof config.sqlite3Executable !== 'string') {
      // @todo check if path exists
      throwConfigInvalidValueError('sqlite3Executable', config.sqlite3Executable);
    }
  },
  storageService: (config) => {
    if (!Object.values(StorageService).includes(config.storageService)) {
      throwConfigInvalidValueError('storageService', config.storageService);
    }
  },
  timeToKeepBackupsInSeconds: (config) => {
    if (config.cleanup !== true)
      return;

    if (typeof config.timeToKeepBackupsInSeconds !== 'number') {
      throwConfigInvalidValueError('timeToKeepBackupsInSeconds', config.timeToKeepBackupsInSeconds);
    }
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
      if (configKey in customValidatorByRequiredConfigKey) {
        customValidatorByRequiredConfigKey[configKey](config);
      } else if (config[configKey] === undefined) {
        throwConfigInvalidValueError(configKey, config[configKey]);
      }
    });
  }
}
