'use strict';

const StorageService = {
  AWS_S3: 'aws-s3',
  GCS: 'gcs'
};

class AbstractStorage {
  put(content, filename) {
    throw new Error('Method put not implemented');
  }

  list() {
    throw new Error('Method list not implemented');
  }

  delete(filenames) {
    throw new Error('Method delete not implemented');
  }
}

class AwsS3 extends AbstractStorage {
  #s3;
  #bucket;

  constructor(
    {
      bucket,
      endpoint = undefined,
      key,
      region = undefined,
      secret,
    }
  ) {
    super();

    console.log({
      bucket,
      endpoint,
      key,
      region,
      secret,
    });

    const AWS = require('aws-sdk');

    const awsConfig = {
      apiVersion: 'latest',
      accessKeyId: key,
      secretAccessKey: secret,
    };

    if (region !== undefined) {
      awsConfig.region = region;
    }

    AWS.config.update(awsConfig);

    const s3Config = {};

    if (endpoint !== undefined) {
      s3Config.endpoint = endpoint;
    }

    this.#s3 = new AWS.S3(s3Config);
    this.#bucket = bucket;
  }

  put(content, filename) {
    return new Promise((resolve, reject) => {
      this.#s3.putObject(
        {
          Bucket: this.#bucket,
          Key: filename,
          Body: content
        },
        function (error) {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        }
      );
    });
  }

  list() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(this.tryToList());
      } catch (error) {
        reject(error);
      }
    });
  }

  async tryToList() {
    let backups = [];
    let params = {
      Bucket: this.#bucket,
      MaxKeys: 1000
    };

    do {
      let response = await this.#s3.listObjectsV2(params).promise();

      backups = backups.concat(
        response.Contents.map((content => ({
          name: content.Key,
          date: new Date(content.LastModified)
        })))
      );

      params.ContinuationToken = response.NextContinuationToken;

    } while (params.ContinuationToken);

    return backups;
  }

  delete(filenames) {
    return new Promise((resolve, reject) => {
      this.#s3.deleteObjects(
        {
          Bucket: this.#bucket,
          Delete: {
            Objects: filenames.map(filename => ({
              Key: filename
            }))
          }
        },
        function (error) {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        }
      );
    });
  }
}

class GoogleCloudStorage extends AbstractStorage {
  #bucket;

  constructor(
    {
      keyFilename,
      bucketName
    }
  ) {
    super();

    const {
      Storage
    } = require('@google-cloud/storage');

    this.#bucket = new Storage({ keyFilename }).bucket(bucketName);
  }

  put(content, filename) {
    return new Promise((resolve, reject) => {
      this.#bucket
        .upload(
          content.path,
          { destination: filename },
          function (error) {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          }
        );
    });
  }

  list() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(this.tryToList());
      } catch (error) {
        reject(error);
      }
    });
  }

  async tryToList() {
    let backups = [];
    let query = {};

    do {
      let [ files, nextQuery ] = await this.#bucket.getFiles(query);

      backups = backups.concat(
        files.map((file => ({
          name: file.metadata.name,
          date: new Date(file.metadata.updated)
        })))
      );

      query = nextQuery;

    } while (query);

    return backups;
  }

  delete(filenames) {
    return new Promise((resolve, reject) => {
      for (const filename of filenames) {
        this.#bucket
          .file(filename)
          .delete((error) => {
            if (error) {
              reject(error);
            }
          });
      }

      resolve();
    });
  }
}

/** @returns { AbstractStorage } */
const createStorageServiceFromConfig = (
  {
    storageService,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion = undefined,
    awsS3Endpoint = undefined,
    awsS3Bucket,
    gcsKeyFilename,
    gcsBucketName
  }
) => {
  switch (storageService) {
    case StorageService.AWS_S3:
      return new AwsS3({
        key: awsAccessKeyId,
        secret: awsSecretAccessKey,
        region: awsRegion,
        endpoint: awsS3Endpoint,
        bucket: awsS3Bucket
      });
    case StorageService.GCS:
      return new GoogleCloudStorage({
        keyFilename: gcsKeyFilename,
        bucketName: gcsBucketName
      });
  }

  throw new Error(
    `“${storageService}“ is not a valid strapi-plugin-backup config “storageService“ value.`
    + ` Available values are : ${Object.values(StorageService).join(', ')}.`
  );
};

module.exports = {
  createStorageServiceFromConfig,
  StorageService
};
