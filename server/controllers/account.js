const Bcrypt = require('bcrypt');
const {
  changePassword, deleteUser, validUser,
  addAccount, getWeekStats, getMonthStats, connect } = require('../models')
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
      const user = await validUser(username);
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
        request.cookieAuth.set('clientDate', date);
        request.cookieAuth.set('diff', diff);
        console.log('credentials', request.auth.artifacts);
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
    async handler(request, h) {
      const { username, password } = request.payload;
      try {
        await addAccount(username, password);
        request.cookieAuth.set({ username });
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
          version: Joi.string().regex(/^\d+\.\d+\.\d+$/).required(),
          start: Joi.number().unit('milliseconds')
        }).required(),
        status: {
          401: Joi.string().regex(/^\d+\.\d+\.\d+$/).required()
        }
      },
      auth: {
        strategy: 'restricted',
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
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
          request.cookieAuth.set('clientDate', date);
          request.cookieAuth.set('diff', diff);
          console.log('credentials', request.auth.artifacts);
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
      auth: 'restricted',
      validate: {
        payload: Joi.object({
          password: Joi.string().required(),
          newPassword: Joi.string().required()
        }).required()
      },
      response: {
        schema: Joi.object({
          type: Joi.string().required(),
          payload: Joi.string().required()
        }).required()
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    async handler(request, h) {
      try {
        const { username } = request.auth.credentials;
        const { password, newPassword } = request.payload;
        const user = await validUser(username);
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
      auth: 'restricted',
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        }).required()
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
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
      auth: 'restricted',
      response: {
        schema: Joi.array().items(
          Joi.object({
            sunday: Joi.number().required(),
            monday: Joi.number().required(),
            tuesday: Joi.number().required(),
            wednesday: Joi.number().required(),
            thursday: Joi.number().required(),
            friday: Joi.number().required(),
            saturday: Joi.number().required()
          }).required(),
          Joi.array().items(Joi.number().required()).length(7).required()
        ).length(2).required()
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    async handler(request) {
      const { username, clientDate, diff } = request.auth.credentials;
      const date = moment(clientDate).utcOffset(diff, false);
      return getWeekStats(username, date);
    }
  });
  server.route({
    method: 'GET',
    path: '/stats/month',
    options: {
      auth: 'restricted',
      response: {
        schema: Joi.array().max(6).items(
          Joi.object({
            sunday: Joi.number(),
            monday: Joi.number(),
            tuesday: Joi.number(),
            wednesday: Joi.number(),
            thursday: Joi.number(),
            friday: Joi.number(),
            saturday: Joi.number()
        }).required()).required()
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    async handler(request) {
      const { username, clientDate, diff } = request.auth.credentials;
      const date = moment(clientDate).utcOffset(diff, false);
      return getMonthStats(username, date);
    }
  });
};

exports.name = 'account';
