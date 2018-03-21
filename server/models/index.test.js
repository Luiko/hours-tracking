const { getWeekSeconds, getUsers } = require('./index');
const test = require('tape');

test('week seconds', async function (t) {
  t.plan(1);
  const msg = 'should return a number';
  try {
    var result = await getWeekSeconds('jeronimo');
  } catch (error) {
    t.fail(msg);
  }
  t.true(Number.isSafeInteger(result), msg);
});

test('get users', async function (t) {
  const msg = 'hash of users';
  try {
    var result = await getUsers();
  } catch (error) {
    t.fail(msg);
  }
  t.true(result instanceof Object, msg);
});
