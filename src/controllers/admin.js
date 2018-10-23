const { getWeekStats } = require('../models');
const moment = require('moment');
const Joi = require('joi')

async function handler(route, request, h) {
  const { username, diff } = request.auth.credentials;
  if (username === process.env.ADMIN) {
    let date;
    switch (route) {
      case 'post_ms':
        date = moment(request.payload).utcOffset(diff, false);
      break;
      case 'get_ms':
        date = moment(request.params.time).utcOffset(diff, false);
      break;
      case 'get_date': {
        const [year, month, day] = request.params.date.split('/');
        date = moment(new Date(year, month, day)).utcOffset(diff, false);
      };
      break;
    }
    const [week] = await getWeekStats(username, date);
    return week[moment(date).format('dddd').toLowerCase()];
  }
  return h.response('').code(401);
}

exports.register = function (server) {
  const hour = 60 * 60;
  server.route({
    path: '/api/dayhours',
    method: 'POST',
    handler: handler.bind(null, 'post_ms'),
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
    handler: handler.bind(null, 'get_ms'),
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
  const validateDateAPI =
    /^20[1-2][0-9]\/(1[0-2]|[1-9])\/(3[0-1]|[1-2][0-9]|[1-9])$/;
  server.route({
    path: '/api/dayhours/{date*3}',
    method: 'GET',
    handler: handler.bind(null, 'get_date'),
    options: {
      auth: 'restricted',
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      response: { schema: Joi.number().min(0).max(168).required() },
      validate: { params: {
          date: Joi.string().regex(validateDateAPI).required()
        }
      }
    }
  });
};

exports.name = "admin_api";
