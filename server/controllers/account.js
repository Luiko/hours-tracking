const Bcrypt = require('bcrypt');
const {
  getUsers, changePassword, deleteUser,
  addAccount, getWeekStats, connect } = require('../models')
;
const moment = require('moment');
const updateCookieState = require('../lib/updateCookieState');
const Joi = require('joi');

exports.register = function (server) {

  connect();

  server.route({
    method: 'POST',
    path: '/login',
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required(),
          date: Joi.date().required(),
          diff: Joi.number().required()
        }).required()
      },
      response: {
        schema: Joi.object({
          type: Joi.string().required(),
          username: Joi.string().required(),
          dayHours: Joi.number().required(),
          weekHours: Joi.number().required(),
          remainingTime: Joi.number().required()
        }).required(),
        status: {
          401: Joi.object({
            type: Joi.string().required(),
            payload: Joi.strict().required()
          }).required()
        }
      }
    },
    async handler(request, h) {
      if (request.auth.isAuthenticated) {
        return { type: 'info', payload: 'you are already authenticated' };
      }
      try {
        var { username, password } = request.payload;
      } catch (error) {
        return h.response({
          type: 'error', payload: 'write valid fields'
        }).code(400);
      }
      if (!username || !password) {
        return h.response({
          type: 'error', payload: 'write valid fields'
        }).code(400);
      }
      const users = await getUsers();
      const user = users[username];
      if (!user) {
        return h.response({
          type: 'error', payload: 'invalid username or password'
        }).code(401);
      }
      if (await Bcrypt.compare(password, user.password)) {
        request.cookieAuth.set({ username });
        const { date, diff } = request.payload;
        const clientDate = moment(date).utcOffset(diff);
        const {
          dayHours, weekHours, remainingTime
        } = await updateCookieState(username, request, clientDate);
        console.log('credentials', {
          username, dayHours, weekHours, remainingTime, clientDate: date, diff
        });
        request.cookieAuth.set('clientDate', date);
        request.cookieAuth.set('diff', diff);
        return {
          type: 'info', username, dayHours,
          weekHours, remainingTime
        };
      }
      return h.response({
        type: 'error', payload: 'invalid username or password'
      }).code(401);
    }
  });
  server.route({
    method: 'POST',
    path: '/signup',
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        }).required()
      },
      response: {
        schema: Joi.string().required()
      }
    },
    async handler({ cookieAuth, payload }, h) {
      const { username, password } = payload;
      try {
        await addAccount(username, password);
        cookieAuth.set({ username });
        return username;
      } catch (err) {
        console.error('sign up failed:', err.message);
        return h.response(err.code || err).code(500);
      }
    }
  });
  server.route({
    method: 'POST',
    path: '/auth',
    options: {
      validate: {
        payload: Joi.object({
          date: Joi.date().required(),
          diff: Joi.number().required()
        }).required()
      },
      response: {
        schema: Joi.object({
          username: Joi.string().required(),
          dayHours: Joi.number().required(),
          weekHours: Joi.number().required(),
          remainingTime: Joi.number().required(),
          version: Joi.string().regex(/^\d+\.\d+\.\d+$/).required()
        }).required(),
        status: {
          401: Joi.string().required()
        }
      },
      auth: {
        strategy: 'restricted',
        mode: 'try'
      }
    },
    async handler(request, h) {
      const { isAuthenticated } = request.auth;
      const { version } = server.settings.app;
      if (isAuthenticated) {
        try {
          const { credentials: { username, btnName, start } } = request.auth;
          const { date, diff } = request.payload;
          const clientDate = moment(date).utcOffset(diff);
          const {
            dayHours, weekHours, remainingTime
          } = await updateCookieState(username, request, clientDate);
          console.log('credentials', request.auth.credentials);
          request.cookieAuth.set('clientDate', date);
          request.cookieAuth.set('diff', diff);
          const output = {
            username, dayHours, weekHours, remainingTime, version
          };
          if (btnName === 'Pause') {
            output.start = start;
          }
          return output;
        } catch (error) {
          console.log(error);
          return h.response(error.message).code(500);
        }
      }
      return h.response(version).code(401);
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
  server.route({
    method: 'DELETE',
    path: '/',
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        }).required()
      }
    },
    async handler(request, h) {
      const { username, password } = request.payload;
      await deleteUser(username, password);
      return h.response();
    }
  });
  server.route({
    method: 'GET',
    path: '/stats/week',
    options: {
      auth: 'restricted'
    },
    async handler(request) {
      const { username, clientDate } = request.auth.credentials;
      return getWeekStats(username, clientDate);
    }
  });
};

exports.name = 'account';
