const { getWeekSeconds } = require('./index');
const test = require('tape');

test('week seconds', async function (t) {
  const result = await getWeekSeconds('jeronimo');
  t.true(Number.isSafeInteger(result), 'got seconds');
});
