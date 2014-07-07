// Request reddit credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
RedditOauth.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'reddit'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }

  var credentialToken = Random.id();

  var scope = [];
  if (options && options.requestPermissions) {
      scope = options.requestPermissions.join(',');
  }

  var loginUrl =
      'https://ssl.reddit.com/api/v1/authorize' +
      '?client_id=' + config.clientId + '&response_type=code' + '&state=' + credentialToken +
      '&redirect_uri=' + encodeURIComponent(Meteor.absoluteUrl('_oauth/reddit?close')) +
      '&duration=permanent' + '&scope=' + scope;

  OAuth.initiateLogin(credentialToken, loginUrl, credentialRequestCompleteCallback);
};
