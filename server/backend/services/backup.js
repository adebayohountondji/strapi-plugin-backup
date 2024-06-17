'use strict';

const fs = require("fs");

const {
  createDatabaseDumperFromConfig
} = require("../../../internal/db-dump");

const {
  createStorageServiceFromConfig
} = require("../../../internal/storage");

const {
  createArchive,
  createTmpFilename,
  dateDiffInSeconds,
  getBackupsToKeep
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

  const applyCleanupPolicies = (backups, policies) => {
    const now = new Date();

    // set limits
    const dailyLimit = policies.days ? policies.days * 86400 : policies;
    const weeklyLimit = policies.weeks * 604800; // Convert to seconds
    const monthlyLimit = policies.months * 2592000; // Convert to seconds
  
    const dailyBackups = [];
    const weeklyBackups = [];
    const monthlyBackups = [];
  
    backups.forEach(backupFile => {
      const timeDifferenceInSeconds = (now - backupFile.date) / 1000;
  
      if (timeDifferenceInSeconds <= dailyLimit) {
        dailyBackups.push(backupFile);
      } else if (weeklyLimit && timeDifferenceInSeconds <= weeklyLimit) {
        weeklyBackups.push(backupFile);
      } else if (monthlyLimit && timeDifferenceInSeconds <= monthlyLimit) {
        monthlyBackups.push(backupFile);
      }
    });
  
    // Select unique backups for weekly and monthly periods
    const weeklyBackupsToKeep = getBackupsToKeep(weeklyBackups, 604800);
    const monthlyBackupsToKeep = getBackupsToKeep(monthlyBackups, 2592000);
  
    const backupsToDelete = backups.filter(backupFile =>
      !dailyBackups.includes(backupFile) &&
      !weeklyBackupsToKeep.includes(backupFile) &&
      !monthlyBackupsToKeep.includes(backupFile)
    );
  
    return backupsToDelete;
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
        const databaseDumper = createDatabaseDumperFromConfig({
          ...backupConfig,
          ...createBackupDatabaseConnectionConfigFromStrapi(strapi)
        });

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
          const backupsToDelete = applyCleanupPolicies(backups, backupConfig.cleanupPolicies || backupConfig.timeToKeepBackupsInSeconds);
          const backupNamesToDelete = backupsToDelete?.flatMap((backup) => backup.name);

          return storageService.delete(backupNamesToDelete);
        });
    }
  };
};
