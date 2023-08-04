# Configuration

- [General](#general)
- [Storage](#storage)
- [Database](#database)
- [Uploads](#uploads)
- [Cleanup](#cleanup)

## General

### cronSchedule

- Required
- String

Run the backup on a custom cron schedule.

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      cronSchedule: '0 * * * *', // Run backup each hour
    }
  }
});
```

## Storage

### storageService

- Required
- String

The cloud storage service where backups are persisted.

Available options :

* `aws-s3` for [AWS Simple Storage Service](https://aws.amazon.com/s3)

You must have `s3:PutObject`, `s3:ListBucket`, `s3:DeleteObjects` in your IAM permissions.

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      storageService: 'aws-s3',
      awsAccessKeyId: '<AWS_ACCESS_KEY_ID>',
      awsSecretAccessKey: '<AWS_SECRET_ACCESS_KEY>',
      awsRegion: '<AWS_REGION>',
      awsS3Bucket: '<AWS_S3_BUCKET>'
    }
  }
});
```

* `gcs` for [Google Cloud Storage](https://cloud.google.com/storage)

You must have `storage.objects.create`, `storage.objects.list`, `storage.objects.delete` in your IAM permissions.

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      storageService: 'gcs',
      gcsKeyFilename: '/path/to/your/key/filename', // Full path to the a .json, .pem, or .p12 key downloaded from the Google Developers Console.
      gcsBucketName: '<GCS_BUCKET_NAME>'
    }
  }
});
```

## Database

### databaseDriver

- Required
- String (`sqlite` or `postgres` or `mysql`)
- Default : environment variable `DATABASE_CLIENT`

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      databaseDriver: env('DATABASE_CLIENT'),
    }
  }
});
```

### mysqldumpExecutable

- Required if your strapi database client is `mysql`
- String

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      mysqldumpExecutable: '/path/to/your/mysqldump/bin',
    }
  }
});
```

[Learn more about mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)

### mysqldumpOptions

- Optional
- Array

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      mysqldumpOptions: [
        '--add-drop-table',
        '--extended-insert',
        '--lock-tables',
        '--dump-date'
      ],
    }
  }
});
```

[Learn more about mysqldump options](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)

### pgDumpExecutable

- Required if your strapi database client is `postgres`
- String

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      pgDumpExecutable: '/path/to/your/pg_dump/bin',
    }
  }
});
```

[Learn more about pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)

### pgDumpOptions

- Optional
- Array

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      pgDumpOptions: [
        '--clean',
        '--if-exists'
      ],
    }
  }
});
```

[Learn more about pg_dump options](https://www.postgresql.org/docs/current/app-pgdump.html)

### sqlite3Executable

- Required your strapi database client is `sqlite`
- Array

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      sqlite3Executable: '/path/to/your/sqlite3/bin'
    }
  }
});
```

[Learn more about sqlite3](https://www.sqlite.org/cli.html)

### customDatabaseBackupFilename

- Optional
- Function

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      customDatabaseBackupFilename: () => `strapi-database-backup-${Date.now()}`,
    }
  }
});
```

### disableDatabaseBackup

- Optional
- Boolean
- Default : `false`

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      disableDatabaseBackup: true
    }
  }
});
```

## Uploads

### customUploadsBackupFilename

- Optional
- Function

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      customUploadsBackupFilename: () => `strapi-uploads-backup-${Date.now()}`,
    }
  }
});
```

### disableUploadsBackup

- Optional
- Boolean
- Default : `false`

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      disableUploadsBackup: true
    }
  }
});
```

## Cleanup

### allowCleanup

- Optional
- Boolean
- Default : `false`

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      allowCleanup: true
    }
  }
});
```

### timeToKeepBackupsInSeconds

- Required if `allowCleanup` is `true`
- Number

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      timeToKeepBackupsInSeconds: 172800, // Keeps backups for 2 days
    }
  }
});
```

### cleanupCronSchedule

- Optional
- String
- Default : `config.cronSchedule`

Run the cleanup on a custom cron schedule.

```js
// ./config/plugins.js

module.exports = ({ env }) => ({
  backup: {
    enabled: true,
    config: {
      cleanupCronSchedule: '0 0 * * *', // Run cleanup each day at 00:00
    }
  }
});
```
