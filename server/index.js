#!/usr/bin/env node
const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
const HapiAuthCookie = require('hapi-auth-cookie');
const Bcrypt = require('bcrypt');
const {
  getUsers, addAccount, addIteration, getDaySeconds, getWeekSeconds
} = require('./models');
require('dotenv').config();

const { PORT, COOKIE_PASSWORD, SECURE_CONN } = process.env;
const server = new Hapi.Server({
  port: PORT,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, '../dist')
    }
  }
});

(async function () {
  try {
    await server.register([Inert, HapiAuthCookie]);
  } catch (error) {
    console.error(error);
  }

  const INDEX = 'index.html';

  server.auth.strategy('restricted', 'cookie', {
    cookie: 'sid',
    password: COOKIE_PASSWORD,
    ttl: 2 * 24 * 60 * 60 * 1000,
    clearInvalid: true,
    keepAlive: false,
    isSecure: !!SECURE_CONN.valueOf(),
    redirectTo: '/login',
    redirectOnTry: 'false',
    requestDecoratorName: 'cookieAuth',
    async validateFunc(request, { username }) {
      const users = await getUsers();
      const user = users[username];
      return { valid: !!user };
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: {
        strategy: 'restricted',
        mode: 'try'
      }
    },
    handler: (request, h) => h.file(INDEX)
  });
  server.route({
    method: 'GET',
    path: '/about',
    handler: (request, h) => h.file(INDEX)
  });
  server.route({
    method: 'GET',
    path: '/login',
    handler: (request, h) => h.file(INDEX)
  });
  server.route({
    method: 'POST',
    path: '/login',
    async handler(request, h) {
      if (request.auth.isAuthenticated) return h.redirect('/');
      try {
        var { username, password } = request.payload;
      } catch (error) {
        return h.file(INDEX).code(400);
      }
      if (!username || !password) {
        return h.file(INDEX).code(400);
      }
      const users = await getUsers();
      const user = users[username];
      if (!user) {
          return h.file(INDEX).code(401);
      }
      if (await Bcrypt.compare(password, user.password)) {
        request.cookieAuth.set({ username });
        return h.redirect('/');
      }
      return h.file('index.html'); //fourth auth failed
    }
  });
  server.route({
    method: 'GET',
    path: '/logout',
    options: {
      auth: 'restricted'
    },
    handler(request, h) {
      request.cookieAuth.clear();
      return h.redirect('/');
    }
  });
  server.route({
    method: 'GET',
    path: '/signup',
    handler: (request, h) => h.file(INDEX)
  });
  server.route({
    method: 'POST',
    path: '/signup',
    async handler({ cookieAuth, payload }, h) {
      if (!payload || !payload.email) {
        console.error('invalid payload');
        return h.response({
          message: 'invalid payload',
          statusCode: 400
        }).code(400);
      }
      const { email, username, password } = payload;
      try {
        await addAccount(email, username, password);
        cookieAuth.set({ username });
        return username;
      } catch (err) {
        console.error('sign up failed:', err.message);
        return h.response(err.name || err.code).code(400);
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/auth',
    options: {
      auth: {
        strategy: 'restricted',
        mode: 'try'
      }
    },
    async handler(request, h) {
      const { isAuthenticated } = request.auth;
      if (isAuthenticated) {
        try {
          const { credentials: { username, btnName, start } } = request.auth;
          const hour = 3600;
          const daySeconds = await getDaySeconds(username);
          const weekSeconds = await getWeekSeconds(username);
          const weekHours = Math.floor(weekSeconds / hour);
          const remainingTime = hour - (weekSeconds % hour);
          const remaining = (weekSeconds - daySeconds) % hour;
          const dayHours = Math.floor((daySeconds + remaining) / hour);
          request.cookieAuth.set('dayHours', dayHours);
          request.cookieAuth.set('weekHours', weekHours);
          request.cookieAuth.set('remainingTime', remainingTime);
          console.log('credentials', request.auth.credentials);
          if (btnName === 'Pause') {
            return { username, dayHours, weekHours, remainingTime, start };
          }
          return { username, dayHours, weekHours, remainingTime };
        } catch (error) {
          console.log(error);
          return h.response(error.message).code(500);
        }
      }
      return h.response(false).code(401);
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
    handler(request, h) {
      const { username } = request.auth.credentials;
      request.cookieAuth.set('btnName', 'Continue');
      return addIteration(username, request.payload)
        .then(function () {
          console.log('iteration added to ', username);
          return h.response(`iteration added to ${username}`);
        }, function (err) {
          if (err.statusCode === 404) {
            console.log('add iteration failed', err);
            return h.response(err.message).code(err.statusCode);
          }
          console.log('add iteration failed', err);
          return h.response(err.message).code(500);
      });
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
      const { btnName, start } = request.payload;
      request.cookieAuth.set('btnName', btnName);
      request.cookieAuth.set('start', start);
      return 'state saved';
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true
      }
    }
  });
  try {
    await server.start();
  } catch (error) {
    console.error(error);
  }
  console.log('server running at ' + server.info.uri);
})();

module.exports = server.listener;
