const {
  CommandBuilder,
  parseCommandOptionString,
  parseMysqlConnectionString,
  parsePostgresConnectionString
} = require('../lib/db-dump');

test('parseCommandOptionString', () => {
  expect(
    parseCommandOptionString('--add-drop-table')
  )
    .toEqual({
      name: '--add-drop-table',
      value: ''
    });

  [
    '--user = root',
    '--user= root',
    '--user =root',
    '--user=root',
    '--user root',
  ].forEach(optionString => {
    expect(
      parseCommandOptionString(optionString)
    )
      .toEqual({
        name: '--user',
        value: 'root'
      });
  });
});

test('CommandBuilder::build', () => {
  expect(
    (new CommandBuilder('/bin/mysqldump'))
      .addOption('--add-drop-table')
      .addOption('--add-drop-table') // Try to add --add-drop-table x2
      .addOptionWithValue('--user', 'root')
      .addOptionWithValue('-p', 'root')
      .setOptionsAlias({
        '-p': '--password'
      })
      .setArgs('strapi > database.sql')
      .build()
  )
    .toBe('/bin/mysqldump --add-drop-table --user=root --password=root strapi > database.sql');

  expect(
    (new CommandBuilder('/bin/pg_dump'))
      .setEnvVar('PGPASSWORD', 'root')
      .addOptionWithValue('--username', 'root')
      .addOptionWithValue('--host', '127.0.0.1')
      .addOptionWithValue('--port', '5432')
      .addOptionWithValue('--dbname', 'strapi')
      .addOptionWithValue('--file', 'db.sql')
      .build()
  )
    .toBe('PGPASSWORD=root /bin/pg_dump --username=root --host=127.0.0.1 --port=5432 --dbname=strapi --file=db.sql');
});

test('parseMysqlConnectionString', () => {
  expect(
    parseMysqlConnectionString('mysql://root:root@localhost:3306/strapi')
  )
    .toEqual({
      user: 'root',
      password: 'root',
      host: 'localhost',
      port: '3306',
      database: 'strapi'
    });
});

test('parsePostgresConnectionString', () => {
  expect(
    parsePostgresConnectionString('postgresql://root:root@localhost:5432/strapi')
  )
    .toEqual({
      user: 'root',
      password: 'root',
      host: 'localhost',
      port: '5432',
      database: 'strapi'
    });
});
