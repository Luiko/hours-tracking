const Bcrypt = require('bcrypt');
const { addIteration } = require('../models');
const moment = require('moment');
const updateCookieState = require('../lib/updateCookieState');

exports.register = function (server) {

  server.route({
    method: 'POST',
    path: '/iterations',
    options: {
      auth: 'restricted',
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    async handler(request, h) {
      const { username, clientDate: client, diff } = request.auth.credentials;
      try {
        request.cookieAuth.set('btnName', 'Continue');
        await addIteration(username, request.payload);
      } catch (err) {
        if (err.statusCode === 404) {
          console.log('add iteration failed', err);
          return h.response(err.message).code(err.statusCode);
        }
        console.log('add iteration failed', err);
        return h.response(err.message).code(500);
      }
      const clientDate = moment(client).utcOffset(diff);
      await updateCookieState(username, request, clientDate);
      console.log('iteration added to ', username);
      return h.response(`iteration added to ${username}`);
    }
  });
  server.route({
    method: 'POST',
    path: '/password',
    options: {
      auth: 'restricted'
    },
    handler() {
      return 'password changed';
    }
  });
};

exports.name = 'account';
