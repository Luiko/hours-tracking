const test = require('tape');
const request = require('supertest');
const app = require('./index');
require('dotenv').config();
const { version } = require('../package.json');

test('auth', function (t) {
  t.plan(2);
  request(app)
    .get('/')
    .expect(200)
    .then(
      () => t.pass('server up and running'),
      (err) => t.fail('server failded \n' + err)
    )
    .catch(t.fail)
  ;

  const date = new Date();
  const diff = 0;
  const msg = 'post /auth unauthenticated unauthorized'
  request(app)
    .post('/auth')
    .send({ date, diff })
    .expect(401)
    .expect(version)
    .then(function () {
      t.pass(msg);
    })
    .catch(() => t.fail(msg))
  ;
});

test('get routes', function (t) {
  t.plan(5);
  testGetRoute('about', t);
  testGetRoute('signup', t);
  testGetRoute('login', t);
  const msg = 'restricted way to /logout';
  request(app)
    .get('/logout')
    .expect(401)
    .then(function () {
      t.pass(msg);
    })
    .catch((err) => t.fail(msg + '\n' + err.message))
  ;
  const msg2 = 'get /configuration should be unauthenticated';
  request(app)
    .get('/configuration')
    .expect(401)
    .then(function () {
      t.pass(msg2);
    })
    .catch((err) => t.fail(msg2 + '\n' + err.message))
  ;
  function testGetRoute(route, t) {
    request(app)
      .get('/' + route)
      .expect(200)
      .then(function () {
        t.pass('free way to /' + route);
      })
      .catch((err) => t.fail('fail free way to / ' + err.message))
    ;
  }
});

test('post /login route', function (t) {
  t.plan(7);
  const date = new Date();
  const diff = 0;
  request(app)
    .post('/login')
    .expect(400)
    .then(function () {
      t.pass('bad request to post /login');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/login')
    .send({ username: '', password: '', date, diff })
    .expect(400)
    .then(function () {
      t.pass('bad request to post /login 2');
    })
    .catch(t.fail)
  ;
  const msg = 'username should be a string';
  request(app)
    .post('/login')
    .send({ username: 123, password: 'aas', date, diff })
    .expect(400)
    .then(function () {
      t.pass(msg);
    })
    .catch(() => t.fail(msg))
  ;

  const msg3 = 'password should be a string';
  request(app)
    .post('/login')
    .send({ username: 'qwewe', password: 123, date, diff })
    .expect(400)
    .then(function () {
      t.pass(msg3);
    })
    .catch(() => t.fail(msg3))
  ;
  const msg0 = 'unauthorized(false user) post /login';
  request(app)
    .post('/login')
    .send({ username: 'asd', password: 'saosao', date, diff })
    .expect(401)
    .then(function () {
      t.pass(msg0);
    })
    .catch(() => t.fail(msg0))
  ;
  const msg1 = 'fail auth, post /login';
  request(app)
    .post('/login')
    .send({ username: 'loco', password: 'passport', date, diff })
    .expect(401)
    .then(function () {
      t.pass(msg1);
    })
    .catch(() => t.fail(msg1))
  ;
  const msg2 = 'found/authenticated, post /login';
  request(app)
    .post('/login')
    .send({ username: 'loco', password: 'password', date, diff })
    .expect(200)
    .then(function () {
      t.pass(msg2);
    })
    .catch(() => t.fail(msg2))
  ;
});

test('post /signup route', async function (t) {
  t.plan(5);

  request(app)
    .post('/signup')
    .expect(400)
    .then(function () {
      t.pass('bad request to post /signup');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/signup')
    .send({})
    .expect(400)
    .then(function () {
      t.pass('bad request to post /signup 2');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/signup')
    .send({ username: '' })
    .expect(400)
    .then(function () {
      t.pass('bad request to post /signup password and username is required ');
    })
    .catch(t.fail)
  ;
  const tempUser = 'dsseewe1313dasdwqe3';
  const password = 'adsqwwwq';
  const msg = 'should register new user';
  await request(app)
    .post('/signup')
    .send({ username: tempUser, password })
    .expect(200)
    .then(() => t.pass(msg))
    .catch(() => t.fail(msg))
  ;
  {
  const msg = 'should delete new user';
  request(app)
    .delete('/')
    .send({ username: tempUser, password })
    .expect(200)
    .then(() => t.pass(msg))
    .catch(() => t.fail(msg))
  }
});

test('post /iterations', function (t) {
  t.plan(3);

  request(app)
    .post('/iterations')
    .expect(401)
    .then(function () {
      t.pass('unauthorized to post /iterations');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/iterations')
    .send({})
    .expect(401)
    .then(function () {
      t.pass('unauthorized to post /iterations 2');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/iterations')
    .send({ start: 13211231123, end: 123123124212 })
    .expect(401)
    .then(function () {
      t.pass('unauthorized to post /iterations 3');
    })
    .catch(t.fail)
  ;
});

test('post /session route', function (t) {
  request(app)
    .post('/session')
    .expect(401, function (err) {
      const msg = 'should fail post /session with empty payload';
      if (err) {
        t.fail(msg + ': ' + err.message);
        return;
      }
      t.pass(msg);
    })
  ;
  request(app)
    .post('/session')
    .send({ btnName: 'PAUSE', start: Date.now() - 3600 })
    .expect(401, function (err) {
      const msg = 'should fail post /session without auth';
      if (err) {
        t.fail(msg + ': ' + err.message);
        return;
      }
      t.pass(msg);
    })
  ;
});
