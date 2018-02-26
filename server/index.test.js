const test = require('tape');
const request = require('supertest');
const app = require('./index');
const { deleteUser } = require('./models/index');
require('dotenv').config();

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

  request(app)
    .get('/auth')
    .expect(401)
    .expect('false')
    .then(function () {
      t.pass('unauthenticated unauthorized');
    })
    .catch(t.fail)
  ;
});

test('get routes', function (t) {
  t.plan(4);
  testGetRoute('about', t);
  testGetRoute('signup', t);
  testGetRoute('login', t);
  request(app)
    .get('/logout')
    .expect(302)
    .then(function () {
      t.pass('restricted way to /logout');
    })
    .catch(t.fail)
  ;
});
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

test('post routes', function (t) {
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
    .send({ username: '', password: '' })
    .expect(400)
    .then(function () {
      t.pass('bad request to post /login 2');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/login')
    .send({ username: 'asd', password: 'saosao' })
    .expect(401)
    .then(function () {
      t.pass('unauthorized(false user) post /login');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/login')
    .send({ username: 'loco', password: 'passport' })
    .expect(200)
    .then(function () {
      t.pass('fail auth, post /login');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/login')
    .send({ username: 'loco', password: 'password' })
    .expect(302)
    .then(function () {
      t.pass('found/authenticated, post /login');
    })
    .catch(t.fail)
  ;

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
      t.pass('bad request to post /signup email, password and username is required ');
    })
    .catch(t.fail)
  ;
  request(app)
    .post('/signup')
    .send({ email: 'asdqww', username: 'sdadqw', password: 'adsasd' })
    .expect(400)
    .then(function () {
      t.pass('bad request to post /signup email invalid');
    })
    .catch(t.fail)
  ;
  const email = 'asdqww@asds.sad';
  const username = 'sdadqw';
  const password = 'adsasd';
  Promise.resolve()
   .then(function () {
    return request(app)
      .post('/signup')
      .send({ email, username, password })
      .expect(200)
      .then(function () {
        t.pass('create new user /signup');
      })
      .catch((err) => t.fail('create new user ' + err.message));
   })
   .then(function () {
    return request(app)
      .post('/signup')
      .send({ email, username, password })
      .expect(400)
      .then(function () {
        t.pass('error create duplicate user /signup');
      })
      .catch(t.fail);
    })
    .then(() => deleteUser(username))
  ;

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

test('temp cookie', function () {

});
