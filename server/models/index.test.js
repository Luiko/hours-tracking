const { getWeekSeconds, getUsers } = require('./index');
const test = require('tape');

test('week seconds', async function (t) {
  t.plan(1);
  const result = await getWeekSeconds('jeronimo');
  t.true(Number.isSafeInteger(result), 'got seconds');
});

test('get users', async function (t) {
  const result = await getUsers();
  t.true(result instanceof Object, 'hash of users');
});
