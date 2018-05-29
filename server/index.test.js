const test = require('tape');
const request = require('supertest');
const app = require('./index');
require('dotenv').config();
const { version } = require('../package.json');

const agent = request.agent(app);
const user = 'algo';
const login = agent
  .post('/login')
  .send({
    username: user, password: user, date: new Date, diff: 0
});

test('/auth route', async function (t) {
  t.plan(5);
  request(app)
    .get('/')
    .expect(200)
    .then(
      () => t.pass('server up and running'),
      (err) => t.fail('server failded. ' + err)
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
  await login;
  {const msg = 'should fail, bad request';
  agent
    .post('/auth')
    .send({ diff: 'adsa' })
    .expect(400)
    .then(function () {
      t.pass(msg);
    })
    .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should pass auth';
  agent
    .post('/auth')
    .send({ date, diff })
    .expect(200)
    .then(function (res) {
      t.pass(msg);
      t.equal(res.body.version, version, 'should receive version app');
    })
    .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
});

test('statics routes', function (t) {
  t.plan(6);
  testPublicRoute('about', t);
  testPublicRoute('signup', t);
  testPublicRoute('login', t);
  const msg = 'restricted way to /logout';
  request(app)
    .get('/logout')
    .expect(401)
    .then(function () {
      t.pass(msg);
    })
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;
  {const msg = 'get /configuration should be restricted';
  request(app)
    .get('/configuration')
    .expect(401)
    .then(function () {
      t.pass(msg);
    })
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
  {const msg = 'get /stats should be restricted';
  request(app)
    .get('/stats')
    .expect(401)
    .then(function () {
      t.pass(msg);
    })
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
  function testPublicRoute(route, t) {
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

  {const msg = 'password should be a string';
  request(app)
    .post('/login')
    .send({ username: 'qwewe', password: 123, date, diff })
    .expect(400)
    .then(function () {
      t.pass(msg);
    })
    .catch(() => t.fail(msg))
  ;}
  {const msg = 'unauthorized(false user) post /login';
  request(app)
    .post('/login')
    .send({ username: 'asd', password: 'saosao', date, diff })
    .expect(401)
    .then(function () {
      t.pass(msg);
    })
    .catch(() => t.fail(msg))
  ;}
  {const msg = 'fail auth, post /login';
  request(app)
    .post('/login')
    .send({ username: 'loco', password: 'passport', date, diff })
    .expect(401)
    .then(function () {
      t.pass(msg);
    })
    .catch(() => t.fail(msg))
  ;}
  {const msg = 'found/authenticated, post /login';
  request(app)
    .post('/login')
    .send({ username: 'loco', password: 'password', date, diff })
    .expect(200)
    .then(function () {
      t.pass(msg);
    })
    .catch(() => t.fail(msg))
  ;}
});

test('post /signup and delete / routes', async function (t) {
  t.plan(6);

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
  const agent = request.agent(app);
  await agent
    .post('/signup')
    .send({ username: tempUser, password })
    .expect(200)
    .then(() => t.pass(msg))
    .catch((err) => {
      t.fail(msg + '. ' + err.message)
      const date = new Date();
      const diff = 0;
      return agent.post('/login').send({
        username: tempUser, password, date, diff
      });
    })
  ;
  {const msg = 'delete / should be restricted';
  request(app)
    .delete('/')
    .send({ username: tempUser, password })
    .expect(401)
    .then(() => t.pass(msg))
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
  {const msg = 'should delete new user';
  agent
    .delete('/')
    .send({ username: tempUser, password })
    .expect(200)
    .then(() => t.pass(msg))
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
});

test('post /session route', async function (t) {
  t.plan(3);
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
  const msg = 'should start a session';
  agent
    .post('/session')
    .set('Content-type', 'text/plain')
    .send(Date.now().toString())
    .expect(200)
    .then(() => t.pass(msg))
    .catch(() => t.fail(msg))
  ;
});

test('post /iterations', function (t) {
  t.plan(6);

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

  {const msg = 'should fail, bad request';
  agent
    .post('/iterations')
    .send({})
    .expect(400)
    .then(() => t.pass(msg))
    .catch(err => t.fail(msg + '. ' + err.message))
  ;}

  {const msg = 'should pass';
  const timestamp = Date.now();
  agent
    .post('/iterations')
    .send({ start: timestamp - 2000, end: timestamp + 2000  })
    .expect(200)
    .then((res) => {
      t.pass(msg);
      t.equal(typeof res.text, 'string', 'should reply with message');
      console.log(res.text);
    })
    .catch(err => t.fail(msg + '. ' + err.message))
  ;}
});

test('post /password', function (t) {
  t.plan(6);
  const msg = 'should be restricted';
  request(app)
    .put('/password')
    .expect(401)
    .then(() => t.pass(msg))
    .catch((err) => t.fail(msg + '. ' + err.message))
    ;
    {const msg = 'should fail, bad request';
    agent
      .put('/password')
      .expect(400)
      .then(() => t.pass(msg))
      .catch((err) => t.fail(msg + '. ' + err.message))
    ;}
    {const msg = 'should fail, bad request too much payload data';
    agent
      .put('/password')
      .send({ password: 'cato', newPassword: 'coto', username: user })
      .expect(400)
      .then(() => t.pass(msg))
      .catch((err) => t.fail(msg + '. ' + err.message))
    ;}
    {const msg = 'should fail, invalid current password';
    agent
      .put('/password')
      .send({ password: 'cato', newPassword: 'coto' })
      .expect(400)
      .then(() => t.pass(msg))
      .catch((err) => t.fail(msg + '. ' + err.message))
    ;}
    {const msg = 'should pass, valid request';
    agent
      .put('/password')
      .send({ password: user, newPassword: user })
      .expect(200)
      .then((res) => {
        t.pass(msg);
        t.deepEqual(
          { type: 'info', payload: 'password changed' },
          res.body,
          'should send info message'
        );
      })
      .catch((err) => t.fail(msg + '. ' + err.message))
    ;}
  });
