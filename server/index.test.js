const test = require('tape');
const request = require('supertest');
const app = require('./index');

test('auth', function (t) {
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
    .expect(200)
    .expect('false')
    .then(function () {
      t.pass('unauthenticated');
    })
    .catch(t.fail)
  ;
});
