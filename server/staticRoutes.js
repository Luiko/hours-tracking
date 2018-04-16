exports.register = function (server) {
  const handler = (request, h) => h.file(server.settings.app.INDEX);

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: {
        strategy: 'restricted',
        mode: 'try'
      }
    },
    handler
  });
  server.route({
    method: 'GET',
    path: '/about',
    handler
  });
  server.route({
    method: 'GET',
    path: '/login',
    handler
  });
  server.route({
    method: 'GET',
    path: '/logout',
    options: {
      auth: 'restricted'
    },
    handler(request, h) {
      console.log(`user '${request.auth.credentials.username}' logged out`);
      request.cookieAuth.clear();
      return h.redirect('/login');
    }
  });
  server.route({
    method: 'GET',
    path: '/signup',
    handler
  });
  server.route({
    method: 'GET',
    path: '/configuration',
    handler
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
};

exports.name = 'getMethods';
