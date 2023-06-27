'use strict';

const {
  createBackupFilenameFromPrefixAndDate
} = require('../backend/services/utils');

module.exports = ({ strapi }) => {
  const backupConfig = strapi.config.get('plugin.backup');
  const backupService = strapi.plugin('backup').service('backup');
  const backupLogService = strapi.plugin('backup').service('log');

  return {
    backup: {
      task: ({ strapi }) => {
        const date = new Date();

        if (!backupConfig.disableUploadsBackup) {
          const backupFilename = typeof backupConfig.customUploadsBackupFilename === 'function'
            ? backupConfig.customUploadsBackupFilename({ strapi })
            : createBackupFilenameFromPrefixAndDate('uploads', date)
            ;

          backupService.backupFile({
            filePath: `${strapi.dirs.public ? strapi.dirs.public : strapi.dirs.static.public}/uploads`,
            backupFilename,
          })
            .then(() => {
              backupLogService.info(`backup: ${backupFilename}`);
            })
            .catch(function (error) {
              throw error;
            });
        }

        if (!backupConfig.disableDatabaseBackup) {
          const databaseBackupFilename = typeof backupConfig.customDatabaseBackupFilename === 'function'
            ? backupConfig.customDatabaseBackupFilename({ strapi })
            : createBackupFilenameFromPrefixAndDate('database', date)
            ;

          backupService.backupDatabase({
            backupFilename: databaseBackupFilename
          })
            .then(() => {
              backupLogService.info(`backup: ${databaseBackupFilename}`);
            })
            .catch(function (error) {
              throw error;
            });
        }
      },

      options: {
        rule: backupConfig.cronSchedule
      }
    },

    cleanup: {
      task: ({ strapi }) => {
        if (backupConfig.allowCleanup) {
          backupService.cleanup()
            .then(() => {
              backupLogService.info('cleanup');
            })
            .catch(function (error) {
              throw error;
            });
        }
      },

      options: {
        rule: backupConfig.cleanupCronSchedule || backupConfig.cronSchedule
      }
    }
  }
};
