const crypto = require('crypto');
const fs = require('fs');
const os = require('os');

const tar = require('tar');

const tmpDir = () => `${os.tmpdir()}/strapi-plugin-backup`;

const createTmpFilename = () => `${tmpDir()}/${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;

const createArchive = (source, destination) => {
  return new Promise((resolve, reject) => {
    try {
      const sourceFileIsDirectory = fs.statSync(source).isDirectory();

      tar.c(
        {
          cwd: sourceFileIsDirectory ? source : source.split('/').slice(0, -1).join('/'),
          file: destination,
          gzip: true
        },
        sourceFileIsDirectory ? fs.readdirSync(source) : [ source.split('/').slice(-1)[0] ],
        resolve
      );

    } catch (error) {
      reject(error);
    }
  });
};

const dateDiffInSeconds = (date1, date2) => {
  return Math.abs((date2.getTime() - date1.getTime()) / 1000);
};

const getBackupsToKeep = (backups, periodInSeconds) => {
  const uniqueBackups = [];
  const seenPeriods = new Set();

  backups.forEach(backupFile => {
    const period = Math.floor(backupFile.date.getTime() / 1000 / periodInSeconds);

    if (!seenPeriods.has(period)) {
      uniqueBackups.push(backupFile);
      seenPeriods.add(period);
    }
  });

  return uniqueBackups;
};

module.exports = {
  createArchive,
  createTmpFilename,
  dateDiffInSeconds,
  getBackupsToKeep,
  tmpDir
}
