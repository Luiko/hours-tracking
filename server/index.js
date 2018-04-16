#!/usr/bin/env node
const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
const HapiAuthCookie = require('hapi-auth-cookie');
require('dotenv').config();
const fs = require('fs');
const MainControl = require('./controllers/main');
const StaticRoutes = require('./staticRoutes');
const AccountController = require('./controllers/account');
const { getUsers } = require('./models');
const { version } = require('../package.json');

const {
  PORT, COOKIE_PASSWORD, CERT_PATH, PKEY_PATH, NODE_ENV, LOCAL
} = process.env;
let SECURE = true;
if (NODE_ENV !== 'production') {
  SECURE = false;
}

const server = new Hapi.Server({
  address: LOCAL === 'true'? '127.0.0.1' : '0.0.0.0',
  app: { version, INDEX: 'index.html' },
  autoListen: true,
  // cache: { engine: require('catbox-memory') },
  compression: { minBytes: 1024 },
  debug: { request: ['implementation'] },
  host: 'www.horascontadas.com',
  load: { sampleInterval: 0, concurrent: 0 },
  router: { isCaseSensitive: true, stripTrailingSlash: false },
  port: PORT,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, '../dist')
    }
  },
  state: {
    strictHeader: true,
    ignoreErrors: false,
    isSecure: SECURE,
    isHttpOnly: true,
    isSameSite: 'Strict',
    encoding: 'none'
  },
  tls: SECURE?
    { cert: fs.readFileSync(CERT_PATH), key: fs.readFileSync(PKEY_PATH) }
    : undefined
});

(async function () {
  try {
    await server.register([Inert, HapiAuthCookie]);
  } catch (error) {
    console.error(error);
  }

  server.auth.strategy('restricted', 'cookie', {
    cookie: 'sid',
    password: COOKIE_PASSWORD,
    ttl: 8 * 60 * 60 * 1000,
    clearInvalid: true,
    keepAlive: false,
    isSecure: SECURE,
    redirectTo: '/login',
    redirectOnTry: 'false',
    requestDecoratorName: 'cookieAuth',
    async validateFunc(request, { username }) {
      const users = await getUsers();
      const user = users[username];
      return { valid: !!user };
    }
  });

  try {
    await server.register([MainControl, StaticRoutes, AccountController]);
    await server.start();
  } catch (error) {
    console.error(error);
  }
  console.log('server running at ' + server.info.uri);
})();

module.exports = server.listener;
