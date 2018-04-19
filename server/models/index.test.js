const { getWeekSeconds, getDaySeconds, getUsers } = require('./index');
const test = require('tape');

test('seconds', async function (t) {
  t.plan(2);
  let msg = 'should return a week seconds as number';
  try {
    var result = await getWeekSeconds('jeronimo', new Date);
  } catch (error) {
    t.fail(msg);
  }
  t.true(Number.isSafeInteger(result), msg);
  msg = 'should return a day seconds as number';
  try {
    var result = await getDaySeconds('jeronimo', new Date);
  } catch (error) {
    t.fail(msg);
  }
  t.true(Number.isSafeInteger(result), msg);
});

test('get users', async function (t) {
  const msg = 'should return a hash of users';
  try {
    var result = await getUsers();
  } catch (error) {
    t.fail(msg);
  }
  t.true(result instanceof Object, msg);
});
