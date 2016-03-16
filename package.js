Package.describe({
  name: 'pandawhisperer:reddit-oauth',
  version: '0.0.8',
  // Brief, one-line summary of the package.
  summary: 'Login service for reddit accounts',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/PandaWhisperer/meteor-reddit-oauth.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('oauth', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('http', ['client', 'server']);
  api.use('templating', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('RedditOauth');

  api.addFiles( ['reddit_configure.html', 'reddit_configure.js'], 'client');

  api.addFiles('reddit_server.js', 'server');
  api.addFiles('reddit_client.js', 'client');
});
