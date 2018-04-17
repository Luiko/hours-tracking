const Bcrypt = require('bcrypt');
const { addIteration, getUsers, changePassword } = require('../models');
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
    method: 'PUT',
    path: '/password',
    options: {
      auth: 'restricted'
    },
    async handler(request, h) {
      try {
        const { username } = request.auth.credentials;
        const { password, newPassword } = request.payload;
        const users = await getUsers();
        const user = users[username];
        if (!user) {
          return h.response({
            type: 'error', payload: 'invalid username'
          }).code(500);
        }
        if (await Bcrypt.compare(password, user.password)) {
          await changePassword(username, newPassword);
          return {
            type: 'info', payload: 'password changed'
          };
        }
        return h.response({
          type: 'error', payload: 'invalid actual password'
        }).code(400);
      } catch (error) {
        return h.response({ type: 'error', payload: error.message }).code(500);
      }
    }
  });
};

exports.name = 'account';
