const { dateDiffInSeconds } = require('../lib/utils');

test('dateDiffInSeconds', () => {

  expect(dateDiffInSeconds(new Date('2023-06-10T11:00:00.000Z'), new Date('2023-06-10T17:00:00.000Z')))
    .toBe(21600);

});

