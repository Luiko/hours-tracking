const { addIteration } = require('../models');
const moment = require('moment');
const updateCookieState = require('../lib/updateCookieState');
const Joi = require('joi');

exports.register = function (server) {
  server.route({
    method: 'POST',
    path: '/session',
    options: {
      auth: 'restricted',
      validate: {
        payload: Joi.date().timestamp().required()
      },
      response: {
        schema: Joi.string().required()
      }
    },
    handler(request) {
      const start = request.payload;
      request.cookieAuth.set('btnName', 'Pause');
      request.cookieAuth.set('start', start);
      return 'state saved';
    }
  });
  server.route({
    method: 'POST',
    path: '/iterations',
    options: {
      auth: 'restricted'
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
};

exports.name = 'iteration';
