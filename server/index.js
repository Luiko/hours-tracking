const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
const HapiAuthCookie = require('hapi-auth-cookie');
const Bcrypt = require('bcrypt');
const { getUsers, addAccount } = require('./models');
require('dotenv').config();

const server = new Hapi.Server({
  port: process.env.PORT,
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
    password: process.env.COOKIE_PASSWORD,
    clearInvalid: true,
    keepAlive: false,
    isSecure: false,
    redirectTo: '/login',
    redirectOnTry: 'false',
    requestDecoratorName: 'cookieAuth',
    validateFunc: async function (request, { username }) {
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
    handler: async function (request, h) {
      if (request.auth.isAuthenticated) return h.redirect('/');
      try {
        var { username, password } = request.payload;
      } catch (error) {
        return h.file(INDEX).code(400); //missing username or password
      }
      if (!username || !password) {
        return h.file(INDEX).code(400); //missing username or password
      }
      const users = await getUsers();
      const user = users[username];
      if (!user) {
          return h.file(INDEX).code(401); //invalid username
      }
      if (await Bcrypt.compare(password, user.password)) {
        request.cookieAuth.set({ username });
        return h.redirect('/'); //home authenticated
      }
      return h.file('index.html'); //auth failed
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
    handler({ payload }, h) {
      return addAccount(payload.username, payload.email, payload.password)
        .then(function (username) {
          return username;
        })
        .catch(function (err) {
          console.error('sign up failed');
          console.error(err.message);
          return h.response(err.errors || err.code).code(400);
        })
      ;
    }
  })

  server.route({
    method: 'GET',
    path: '/auth',
    options: {
      auth: {
        strategy: 'restricted',
        mode: 'try'
      }
    },
    handler: (request) => request.auth.isAuthenticated && request.auth.credentials
  })

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
