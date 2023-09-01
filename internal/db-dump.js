'use strict';

const {exec} = require('child_process');

const StrapiDatabaseDriver = {
  MYSQL: 'mysql',
  POSTGRES: 'postgres',
  SQLITE: 'sqlite'
};

const parseCommandOptionString = (optionString) => {
  return optionString.match(
    /(?<name>[^=,\s]+)(=|\s)*(?<value>\S*)/
  ).groups;
}

class CommandBuilder {
  #envVars;
  #executable;
  #options;
  #valuePerOption;
  #args;

  constructor(executable) {
    this.#envVars = {};
    this.#executable = executable;
    this.#options = [];
    this.#valuePerOption = {};
    this.#args = '';
  }

  addOptionWithValue(optionName, optionValue) {
    this.#valuePerOption[optionName] = optionValue;
    this.addOption(optionName);
    return this;
  }

  addOption(option) {
    if (!this.#options.includes(option)) {
      this.#options.push(option);
    }

    return this;
  }

  setArgs(args) {
    this.#args = args;
    return this;
  }

  setEnvVar(name, value) {
    this.#envVars[name] = value;
    return this;
  }

  build() {
    let command = `${this.#executable} ${this.optionsToString()}`;

    if (this.#args) {
      command += ` ${this.#args}`;
    }

    if (Object.keys(this.#envVars).length) {
      const envVarsString = Object.keys(this.#envVars)
        .map(name => `${name}=${this.#envVars[name]}`)
        .join(' ');

      command = `${envVarsString} ${command}`;
    }

    return command;
  }

  optionsToString() {
    return this.#options.map((option) => {
      if (option in this.#valuePerOption) {
        return `${option}=${this.#valuePerOption[option]}`;
      }

      return option;
    })
      .join(' ')
  }
}

class DatabaseDumper {
  dump(outputFilePath) {
    throw new Error('Method dump not implemented');
  }
}

class RelationalDatabaseDumper extends DatabaseDumper {
  dump(outputFilePath) {
    return new Promise((resolve, reject) => {
      exec(this.getDumpCommandFromOutputFilePath(outputFilePath), (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  getDumpCommandFromOutputFilePath() {
    throw new Error('getDumpCommandFromOutputFilePath dump not implemented');
  }
}

const parseMysqlConnectionString = (connectionString) => {
  return connectionString.match(
    /mysql:\/\/(?<user>.+):(?<password>.*)@(?<host>.+):(?<port>[0-9]+)\/(?<database>.+)/
  ).groups;
}

class MysqlDump extends RelationalDatabaseDumper {
  #executable;
  #connection;
  #options;

  static #protectedOptions = [
    '-u',
    '--user',
    '-p',
    '--password',
    '-h',
    '--host',
    '-P',
    '--port'
  ];

  constructor(
    executable,
    connection = {
      user,
      password,
      host,
      port,
      database
    },
    options
  ) {
    super();
    this.#executable = executable;
    this.#connection = connection;
    this.#options = options;
  }

  getDumpCommandFromOutputFilePath(outputFilePath) {
    let commandBuilder = new CommandBuilder(this.#executable);

    this.#options.forEach(optionString => {
      let option = parseCommandOptionString(optionString);

      if (MysqlDump.#protectedOptions.includes(option.name)) {
        return;
      }

      if (option.value) {
        commandBuilder.addOptionWithValue(option.name, option.value);
      } else {
        commandBuilder.addOption(option.name);
      }
    });

    commandBuilder
      .addOptionWithValue('--user', this.#connection.user)
      .addOptionWithValue('--password', this.#connection.password)
      .addOptionWithValue('--host', this.#connection.host)
      .addOptionWithValue('--port', this.#connection.port)
      .setArgs(`${this.#connection.database} > ${outputFilePath}`);

    return commandBuilder.build();
  }
}

const parsePostgresConnectionString = (connectionString) => {
  return connectionString.match(
    /postgresql:\/\/(?<user>.+):(?<password>.*)@(?<host>.+):(?<port>[0-9]+)\/(?<database>.+)/
  ).groups;
}

class PgDump extends RelationalDatabaseDumper {
  #executable;
  #connection;
  #options;

  static #protectedOptions = [
    '-U',
    '--username',
    '-W',
    '--password',
    '-h',
    '--host',
    '-p',
    '--port',
    '-d',
    '--dbname',
    '-f',
    '--file',
  ];

  constructor(
    executable,
    connection = {
      user,
      password,
      host,
      port,
      database
    },
    options
  ) {
    super();
    this.#executable = executable;
    this.#connection = connection;
    this.#options = options;
  }

  getDumpCommandFromOutputFilePath(outputFilePath) {
    let commandBuilder = new CommandBuilder(this.#executable);

    this.#options.forEach(optionString => {
      let option = parseCommandOptionString(optionString);

      if (PgDump.#protectedOptions.includes(option.name)) {
        return;
      }

      if (option.value) {
        commandBuilder.addOptionWithValue(option.name, option.value);
      } else {
        commandBuilder.addOption(option.name);
      }
    });

    commandBuilder
      .setEnvVar('PGPASSWORD', this.#connection.password)
      .addOptionWithValue('--username', this.#connection.user)
      .addOptionWithValue('--host', this.#connection.host)
      .addOptionWithValue('--port', this.#connection.port)
      .addOptionWithValue('--dbname', this.#connection.database)
      .addOptionWithValue('--file', outputFilePath);

    return commandBuilder.build();
  }
}

class Sqlite3Dumper extends RelationalDatabaseDumper {
  #filename
  #executable;

  constructor(filename, executable) {
    super();
    this.#filename = filename;
    this.#executable = executable;
  }

  getDumpCommandFromOutputFilePath(outputFilePath) {
    return `${this.#executable} ${this.#filename} ".output ${outputFilePath}" ".dump" && ${this.#executable} ${this.#filename}.sqlite ".exit"`;
  }
}

const createDatabaseDumperFromConfig = (
  {
    databaseDriver,
    user,
    password,
    host,
    port,
    database,
    filename,
    mysqldumpExecutable,
    mysqldumpOptions,
    pgDumpExecutable,
    pgDumpOptions,
    sqlite3Executable
  }
) => {
  switch (databaseDriver) {
    case StrapiDatabaseDriver.MYSQL:
      return new MysqlDump(
        mysqldumpExecutable,
        {
          user,
          password,
          host,
          port,
          database
        },
        mysqldumpOptions
      );
    case StrapiDatabaseDriver.POSTGRES:
      return new PgDump(
        pgDumpExecutable,
        {
          user,
          password,
          host,
          port,
          database
        },
        pgDumpOptions
      );
    case StrapiDatabaseDriver.SQLITE:
      return new Sqlite3Dumper(filename, sqlite3Executable);
  }

  throw new Error(
    `“${databaseDriver}“ is not a valid strapi-plugin-backup config “databaseDriver“ value.`
    + ` Available values are : ${Object.values(StrapiDatabaseDriver).join(', ')}.`
  );
}

module.exports = {
  CommandBuilder,
  createDatabaseDumperFromConfig,
  parseCommandOptionString,
  parseMysqlConnectionString,
  parsePostgresConnectionString,
  StrapiDatabaseDriver
};
