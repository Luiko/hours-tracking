const {
  getWeekSeconds, getDaySeconds, getUsers, validUser,
  getWeekStats, connect } = require('./index')
;
const test = require('tape');

connect();

test('valid user', async function (t) {
  t.plan(2);
  const msg = 'should return a user';
  const user =  await validUser('jeronimo');
  t.equal(user.username, 'jeronimo', msg);

  {const msg = 'should return false';
  const user = await validUser('xrgasgfr1211');
  t.equal(user, false, msg);}
});

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
  t.plan(1);
  const msg = 'should return a hash of users';
  try {
    var result = await getUsers();
  } catch (error) {
    t.fail(msg);
  }
  t.true(result instanceof Object, msg);
});


test('get weeks', async function (t) {
  t.plan(3);
  const data = await getWeekStats('jeronimo', new Date);
  t.assert(Array.isArray(data), 'should return an array');
  const [ week, days ] = data;
  const weekDays = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday'
  ];
  t.deepEqual(Object.keys(week), weekDays,
    'should contain week days as attributes')
  ;
  t.assert(Array.isArray(days),
    'should contain also and array with the week days numbers')
  ;
});
