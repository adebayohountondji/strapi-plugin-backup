# Strapi Plugin Backup

Strapi backup plugin for the cloud.

## Features

- Database backup
- Uploads files backup
- Cleanup of backups

## Installation

```sh
npm install strapi-plugin-backup
```

## Configuration

Please see [documentation](documentation/configuration.md) for more information about configuration.

## Example

```js
// ./config/plugins.js

module.exports = ({ env }) => {
  return ({
    // ...
    backup: {
      enabled: true,
      config: {
        cronSchedule: '0 9-17 * * *', // At minute 0 past every hour from 9 through 17
        storageService: 'aws-s3',
        awsAccessKeyId: '<AWS_ACCESS_KEY_ID>',
        awsSecretAccessKey: '<AWS_SECRET_ACCESS_KEY>',
        awsRegion: '<AWS_REGION>',
        awsS3Bucket: '<AWS_S3_BUCKET>',
        mysqldumpExecutable: '/path/to/your/mysqldump/bin',
        mysqldumpOptions: [
            '--add-drop-table',
            '--extended-insert',
            '--lock-tables',
            '--dump-date'
        ],
        allowCleanup: true,
        timeToKeepBackupsInSeconds: 172800, // 2 days
        cleanupCronSchedule: '0 9 * * *' // Each day at 09:00 AM
      }
    },
    // ...
  })
};
```

## Releases

This project follows the Semantic Versioning convention ([https://semver.org](https://semver.org)) for version numbering.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security

If you discover any security-related issues, please email mail@adebayo.fr instead of using the issue tracker.

## License

Please see [License File](LICENSE) for more information.
