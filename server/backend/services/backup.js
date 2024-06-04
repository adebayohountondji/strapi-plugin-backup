'use strict';

const fs = require("fs");

const {
  createDatabaseDumperFromConfig, StrapiDatabaseDriver
} = require("../../../internal/db-dump");

const {
  createStorageServiceFromConfig
} = require("../../../internal/storage");

const {
  createArchive,
  createTmpFilename,
  dateDiffInSeconds
} = require("../../../internal/utils");

const {
  createBackupDatabaseConnectionConfigFromStrapi
} = require("./utils");

module.exports = ({ strapi }) => {
  const backupConfig = strapi.config.get('plugin.backup');
  const storageService = createStorageServiceFromConfig(backupConfig);

  const backupFile = (
    {
      filePath,
      backupFilename
    }
  ) => {
    return new Promise((resolve, reject) => {
      const tmpArchiveFilePath = createTmpFilename();

      // if the databaseDriver is set to STRAPI_EXPORT, we don't need to create an archive
      if (backupConfig.databaseDriver === StrapiDatabaseDriver.STRAPI_EXPORT) {
        storageService.put(
          fs.createReadStream(`${filePath}.tar.gz`),
          `${backupFilename}.tar.gz`
        ).then(() => {
          resolve();
          fs.unlinkSync(`${filePath}.tar.gz`);
        }).catch(reject);
        return;
      }

      // else, create an archive from the dumped database file
      createArchive(filePath, tmpArchiveFilePath)
        .then(() => {
          return storageService.put(
            fs.createReadStream(tmpArchiveFilePath),
            `${backupFilename}.tar.gz`
          );
        })
        .then(() => {
          resolve();
          fs.unlinkSync(tmpArchiveFilePath);
        })
        .catch(reject);
    });
  };

  return {
    backupFile,

    backupDatabase: (
      {
        backupFilename
      }
    ) => {
      return new Promise((resolve, reject) => {
        const databaseDumpOutputFilename = createTmpFilename();
        const { databaseDriver } = backupConfig;

        let mergedConfig;

        if (databaseDriver === StrapiDatabaseDriver.STRAPI_EXPORT) {
          mergedConfig = {
            ...backupConfig,
            ...createBackupDatabaseConnectionConfigFromStrapi(strapi),
            databaseDriver
          };
        } else {
          mergedConfig = {
            ...backupConfig,
            ...createBackupDatabaseConnectionConfigFromStrapi(strapi)
          }
        }
        
        const databaseDumper = createDatabaseDumperFromConfig(mergedConfig);

        databaseDumper.dump(databaseDumpOutputFilename)
          .then(() => {
            return backupFile({
              filePath: databaseDumpOutputFilename,
              backupFilename
            });
          })
          .then(() => {
            resolve();
            fs.unlinkSync(databaseDumpOutputFilename);
          })
          .catch(reject);
      });
    },

    cleanup: () => {
      return storageService.list()
        .then(backups => {
          let namesOfFilesToBeDeleted = [];

          backups.forEach(backupFile => {
            const archiveDurationInSeconds = dateDiffInSeconds(backupFile.date, new Date());
            if (archiveDurationInSeconds >= backupConfig.timeToKeepBackupsInSeconds) {
              namesOfFilesToBeDeleted.push(backupFile.name);
            }
          });

          return storageService.delete(namesOfFilesToBeDeleted);
        });
    }
  };
};
