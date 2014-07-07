Package.describe({
  summary: "Login service for reddit accounts"
});

Package.on_use(function(api) {
  api.use('oauth', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('http', ['client', 'server']);
  api.use('templating', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('RedditOauth');

  api.add_files( ['reddit_configure.html', 'reddit_configure.js'], 'client');

  api.add_files('reddit_common.js', ['client', 'server']);
  api.add_files('reddit_server.js', 'server');
  api.add_files('reddit_client.js', 'client');
});
