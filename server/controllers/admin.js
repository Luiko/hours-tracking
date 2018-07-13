const { getWeekStats } = require('../models');
const moment = require('moment');
const Joi = require('joi')

exports.register = function (server) {
  const hour = 60 * 60;
  server.route({
    path: '/api/dayhours',
    method: 'POST',
    async handler(request, h) {
      const { username, diff } = request.auth.credentials;
      if (username === process.env.ADMIN) {
        const date = moment(request.payload).utcOffset(diff, false);
        const [week] = await getWeekStats(username, date);
        return week[moment(date).format('dddd').toLowerCase()];
      }
      return h.response('').code(401);
    },
    options: {
      auth: 'restricted',
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      response: { schema: Joi.number().min(0).max(168).required() },
      validate: { payload: Joi.number().unit('milliseconds').required() }
    }
  });
  server.route({
    path: '/api/dayhours/{time}',
    method: 'GET',
    async handler(request, h) {
      const { username, diff } = request.auth.credentials;
      if (username === process.env.ADMIN) {
        const date = moment(request.params.time).utcOffset(diff, false);
        const [week] = await getWeekStats(username, date);
        return week[moment(date).format('dddd').toLowerCase()];
      }
      return h.response('').code(401);
    },
    options: {
      auth: 'restricted',
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      response: { schema: Joi.number().min(0).max(168).required() },
      validate: { params: {
          time: Joi.number().unit('milliseconds').required()
        }
      }
    }
  });
};

exports.name = "admin_api";
