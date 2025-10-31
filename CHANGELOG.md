# Release Notes

## Unreleased

* Dependencies are being updated and compatibility adjustments are being made

## [v2.0.1](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v2.0.0...v2.0.1) - 2025-10-31

* The Cleanup used to display errors when no backups were yet eligible for deletion. Now it properly ignores cases with no files to delete, avoiding MalformedXML errors and misleading logs.

## [v2.0.0](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.1.3...v2.0.0) - 2025-10-31

* Migration of the plugin to support **Strapi 5** (previously Strapi 4)
* General refactoring of the plugin structure to exactly match that of **Strapi 5**
* Compatibility with Node.js >=18.0.0 and <=22.x.x

## [v1.1.3](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.1.2...v1.1.3) - 2024-03-10

* Tag version 1.1.3 with resolution of issue "6-add-support-for-node-20"

## [v1.1.2](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.1.1...v1.1.2) - 2023-12-23

* Prevent the Strapi server from crashing in the event of an error during a backup

## [v1.1.1](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.1.0...v1.1.1) - 2023-11-16

* Improve the supported Node.js version in the engines field

## [v1.1.0](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.0.0...v1.1.0) - 2023-08-23

* [Adding support of Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)

## [v1.0.0](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.0.0-rc.1...v1.0.0) - 2023-08-19

* Adding the plugin logo

## [v1.0.0-rc.1](https://github.com/adebayohountondji/strapi-plugin-backup/compare/v1.0.0-rc...v1.0.0-rc.1) - 2023-08-18

* Adding “databaseDriver“ parameter in configuration documentation
* [Adding support for S3 compatible storage providers](https://github.com/adebayohountondji/strapi-plugin-backup/issues/1)