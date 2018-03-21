const { getWeekSeconds, getUsers } = require('./index');
const test = require('tape');
const privateMethods = require('./_index');

test('week seconds', async function (t) {
  t.plan(1);
  const msg = 'should return a number';
  try {
    var result = await getWeekSeconds('jeronimo', new Date);
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
