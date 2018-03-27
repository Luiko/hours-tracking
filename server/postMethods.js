const Bcrypt = require('bcrypt');
const {
  getUsers, addAccount, addIteration, getDaySeconds, getWeekSeconds
} = require('./models');
const moment = require('moment');

exports.register = function (server) {

  server.route({
    method: 'POST',
    path: '/login',
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
        const { clientDate: client, diff } = request.payload;
        const clientDate = moment(client).utcOffset(diff);
        const {
          dayHours, weekHours, remainingTime
        } = await updateCookieState(username, request, clientDate);
        console.log('credentials', {
          username, dayHours, weekHours, remainingTime, clientDate: client, diff
        });
        request.cookieAuth.set('clientDate', client);
        request.cookieAuth.set('diff', diff);
        return {
          type: 'info', payload: 'Authenticated', username, dayHours,
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
    async handler({ cookieAuth, payload }, h) {
      if (!payload) {
        console.error('invalid payload');
        return h.response({
          message: 'invalid payload',
          statusCode: 400
        }).code(400);
      }
      const { username, password } = payload;
      try {
        await addAccount(username, password);
        cookieAuth.set({ username });
        return username;
      } catch (err) {
        console.error('sign up failed:', err.message);
        return h.response(err.code || err).code(400);
      }
    }
  });
  server.route({
    method: 'POST',
    path: '/auth',
    options: {
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
          const { clientDate: client, diff } = request.payload;
          const clientDate = moment(client).utcOffset(diff);
          const {
            dayHours, weekHours, remainingTime
          } = await updateCookieState(username, request, clientDate);
          console.log('credentials', request.auth.credentials);
          request.cookieAuth.set('clientDate', client);
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
    path: '/session',
    options: {
      auth: 'restricted',
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    handler(request, h) {
      if (!request.payload) {
        return h.response().code(400);
      }
      const { start } = request.payload;
      request.cookieAuth.set('btnName', 'Pause');
      request.cookieAuth.set('start', start);
      return 'state saved';
    }
  });

  async function updateCookieState(username, request, clientDate) {
    const hour = 3600;
    const daySeconds = await getDaySeconds(username, clientDate);
    const weekSeconds = await getWeekSeconds(username, clientDate);
    const weekHours = Math.floor(weekSeconds / hour);
    const remainingTime = hour - (weekSeconds % hour);
    const remaining = (weekSeconds - daySeconds) % hour;
    const dayHours = Math.floor((daySeconds + remaining) / hour);
    request.cookieAuth.set('dayHours', dayHours);
    request.cookieAuth.set('weekHours', weekHours);
    request.cookieAuth.set('remainingTime', remainingTime);
    return { dayHours, weekHours, remainingTime };
  }
};

exports.name = 'postMethods';
