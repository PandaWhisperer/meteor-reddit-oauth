// Request reddit credentials for the user
// @param options {optional}
// @param callback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
RedditOauth.requestCredential = function (options, callback) {
  // support both (options, callback) and (callback).
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'reddit'});
  if (!config) {
    callback && callback(new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }

  var state = Random.id();

  var scope = [];
  if (options && options.requestPermissions) {
      scope = options.requestPermissions.join(',');
  }

  var loginUrl =
      'https://ssl.reddit.com/api/v1/authorize' +
      '?client_id=' + config.appId + '&response_type=code' + '&state=' + state +
      '&redirect_uri=' + encodeURIComponent(Meteor.absoluteUrl('_oauth/reddit?close')) +
      '&duration=permanent' + '&scope=' + scope;

  OAuth.initiateLogin(credentialToken, loginUrl, credentialRequestCompleteCallback);
};
