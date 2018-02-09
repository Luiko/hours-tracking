const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');

const server = new Hapi.Server({
  port: 3000,
  routes: {
    files: {
      relativeTo: Path.join(__dirname, '../dist')
    }
  }
});

(async function () {
  try {
    await server.register(Inert);
  } catch (error) {
    console.error(error);
  }

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => h.file('index.html')
  });
  server.route({
    method: 'GET',
    path: '/about',
    handler: (require, h) => h.file('index.html')
  });
  server.route({
    method: 'GET',
    path: '/login',
    handler: (require, h) => h.file('index.html')
  });
  server.route({
    method: 'GET',
    path: '/logout',
    handler: (require, h) => h.file('index.html')
  });
  server.route({
    method: 'GET',
    path: '/signup',
    handler: (require, h) => h.file('index.html')
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
    console.error(error)
  }
  console.log('server running at ' + server.info.uri);
})();
