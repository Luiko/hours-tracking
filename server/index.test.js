const test = require('tape');
const request = require('supertest');
const app = require('./index');
require('dotenv').config();
const { version } = require('../package');
const { hour } = require('./penv');

const agent = request.agent(app);
const user = 'algo';
const login = (agent) => agent
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
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;
  await login(agent);
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
  t.plan(5);
  testPublicRoute('about', t);
  testPublicRoute('signup', t);
  testPublicRoute('login', t);
  {const msg = 'get /configuration should be restricted';
  request(app)
    .get('/configuration')
    .expect(302)
    .then(function () {
      t.pass(msg);
    })
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
  {const msg = 'get /stats should be restricted';
  request(app)
    .get('/stats')
    .expect(302)
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
    .send({ btnName: 'PAUSE', start: Date.now() - hour })
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
    .send({ start: timestamp - 2000, end: timestamp + 2000 })
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
  t.plan(10);
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
  {agent
    .put('/password')
    .send({ password: user, newPassword: user + 12 })
    .expect(200)
    .then((res) => {
      t.pass('should pass, valid request, password changed');
      t.deepEqual(
        res.body,
        { type: 'info', payload: 'password changed' },
        'route pass should send info message'
      );
    },() => t.fail('should pass, valid request, password changed'))
    .then(() => request(app).post('/login').send({
      username: user, password: user, date: new Date, diff: 0
    }).expect(401))
    .then(
      () => t.pass('should fail with last password'),
      () => t.fail('should fail with last password')
    )
    .then(() => request(app).post('/login').send({
      username: user, password: user + 12, date: new Date, diff: 0
    }).expect(200))
    .then(() => t.pass('user logged in'),() => t.fail('user logged in'))
    .then(() => agent.put('/password')
      .send({ password: user + 12, newPassword: user }).expect(200)
    )
    .then((res) => {
      t.pass('reset changed password');
      t.deepEqual(
        res.body,
        { type: 'info', payload: 'password changed' },
        'should confirm login with new pass'
      );
    }, () => t.pass('reset changed password'))
    .catch((err) => t.fail(err.message))
  ;}
});

test('get /stats/week', function (t) {
  t.plan(5);
  const msg = 'should be restricted';
  request(app)
    .get('/stats/week')
    .expect(401)
    .then(() => t.pass(msg))
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;
  {const msg = 'should pass';
  agent
    .get('/stats/week')
    .expect(200)
    .then((res) => {
      t.pass(msg);
      t.assert(Array.isArray(res.body), 'should return an array');
      const [week, daysnumber] = res.body;
      t.deepEqual(
        Object.keys(week),
        [
          'sunday', 'monday', 'tuesday',
          'wednesday', 'thursday', 'friday', 'saturday'
        ],
        'should return object with days name as attributes'
      );
      t.assert(Array.isArray(daysnumber),
        'should contain an array of numbers')
      ;
    })
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
});

test('get /stats/month', function (t) {
  t.plan(4);
  const msg = 'should be restricted';
  request(app)
    .get('/stats/month')
    .expect(401)
    .then(() => t.pass(msg))
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;
  {const msg = 'should pass';
  agent
    .get('/stats/month')
    .expect(200)
    .then((res) => {
      t.pass(msg);
      const { body: month } = res;
      t.assert(Array.isArray(month), 'should retrieve an array of week');
      t.equal(
        Object.prototype, month[0].__proto__, 'weeks should be objects'
      );
    })
    .catch((err) => t.fail(msg + '. ' + err.message))
  ;}
});

const admin = request.agent(app);

test('post /api/dayhours', async function (t) {
  t.plan(5);
  const msg = 'should be restricted';
  request(app).post('/api/dayhours')
   .expect(401)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;
  {const msg = 'should fail, bad request';
  agent.post('/api/dayhours')
   .expect(400)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should be unauthorized';
  agent.post('/api/dayhours')
   .expect(401)
   .type('text/plain')
   .send(Date.now().toString())
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  await admin.post('/login').send({
    username: process.env.ADMIN, password: '1231', date: new Date, diff: 0
  });
  {const msg = 'should fail with authorization, bad request';
  admin.post('/api/dayhours')
   .expect(400)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should be ok';
  admin.post('/api/dayhours')
   .expect(200)
   .type('text/plain')
   .send(Date.now().toString())
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
});

test('get /api/dayhours/{time}', function (t) {
  t.plan(4);
  const msg = 'should be restricted';
  request(app).get(`/api/dayhours/${Date.now()}`)
   .expect(401)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;
  {const msg = 'should be unauthorized';
  agent.get(`/api/dayhours/${Date.now()}`)
   .expect(401)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should fail with authorization, bad request';
  admin.get(`/api/dayhours/ddqw123`)
   .expect(400)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should be ok';
  admin.get(`/api/dayhours/${Date.now()}`)
   .expect(200)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
});

test('get /api/dayhours/{date*3}', function (t) {
  t.plan(7);
  const msg = 'should be restricted';
  request(app).get('/api/dayhours/2018/8/12')
   .expect(401)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;
  {const msg = 'should fail, bad implementation with month';
  request(app).get('/api/dayhours/2018//12')
   .expect(404)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should fail, bad implementation without day';
  request(app).get('/api/dayhours/2018/8')
   .expect(404)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should be unauthorized';
  agent.get(`/api/dayhours/2018/12/31`)
  .expect(401)
  .then(() => t.pass(msg))
  .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should fail with authorization, bad request';
  admin.get(`/api/dayhours/asad/0/0`)
  .expect(400)
  .then(() => t.pass(msg))
  .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should be ok';
  admin.get(`/api/dayhours/2017/8/12`)
  .expect(200)
  .then(() => t.pass(msg))
  .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should fail, bad implementation with 0 year';
  admin.get('/api/dayhours/0/22/12')
   .expect(400)
   .then(() => t.pass(msg))
   .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
});

test('get /logout', async function (t) {
  t.plan(3);
  const msg = 'should be restricted';
  request(app)
    .get('/logout')
    .expect(302)
    .then(() => t.pass(msg))
    .catch((error) => t.fail(msg + '. ' + error.message))
  ;
  {const msg = 'should log out';
  await agent
    .get('/logout')
    .expect(302)
    .then(() => t.pass(msg))
    .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
  {const msg = 'should fail, restricted again';
  agent
    .get('/logout')
    .expect(302)
    .then(() => t.pass(msg))
    .catch((error) => t.fail(msg + '. ' + error.message))
  ;}
});
