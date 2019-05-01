RedditOauth = {};

// Set a default value for user-agent to use with http-requests.
RedditOauth.userAgent = "Meteor/1.0";

var urlUtil = Npm.require('url');

OAuth.registerService('reddit', 2, null, function(query) {

  var response = getTokenResponse(query);
  var accessToken = response.accessToken;
  var refreshToken = response.refreshToken;
  var scope = (response.scope && typeof response.scope == 'string') ?
                response.scope.split(' ') : [];
  var identity = getIdentity(accessToken);

  var serviceData = {
    id: identity.name,
    accessToken: accessToken,
    refreshToken: refreshToken,
    scope: scope,
    expiresAt: (+new Date) + (1000 * response.expiresIn)
  };

  // include all fields from reddit
  // https://github.com/reddit/reddit/wiki/OAuth2
  var fields = _.pick(identity, ['name']);

  return {
    serviceData: serviceData,
    options: {
      profile: fields
    }
  };
});

// checks whether a string parses as JSON
var isJSON = function (str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// returns an object containing:
// - accessToken
// - refreshToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'reddit'});
  if (!config)
    throw new ServiceConfiguration.ConfigError("Service not configured");

  var responseContent;
  try {
    // Request an access token
    responseContent = HTTP.call("POST", 
      "https://ssl.reddit.com/api/v1/access_token", {
        auth: [config.appId, config.secret].join(':'),
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: Meteor.absoluteUrl("_oauth/reddit?close")
        },
        headers:{"User-Agent": RedditOauth.userAgent}
      }).content;
  } catch (err) {
    throw new Error("Failed to complete OAuth handshake with reddit. " + err.message);
  }

  // If 'responseContent' does not parse as JSON, it is an error.
  if (!isJSON(responseContent)) {
    throw new Error("Failed to complete OAuth handshake with reddit. " + responseContent);
  }

  // Success! Extract access token and expiration
  var parsedResponse = JSON.parse(responseContent);

  var tokenResponse = {};
  tokenResponse.accessToken = parsedResponse.access_token;
  tokenResponse.refreshToken = parsedResponse.refresh_token;
  tokenResponse.scope = parsedResponse.scope;
  tokenResponse.expiresIn = parsedResponse.expires_in;

  if (!tokenResponse.accessToken) {
    throw new Error("Failed to complete OAuth handshake with reddit " +
		    "-- can't find access token in HTTP response. " + responseContent);
  }

  return tokenResponse;
};

var getIdentity = function (accessToken) {
  try {
    return HTTP.call("GET", "https://oauth.reddit.com/api/v1/me", {
      headers: { "Authorization": 'bearer ' + accessToken, "User-Agent": RedditOauth.userAgent}
    }).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from reddit. " + err.message);
  }
};

RedditOauth.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret)
};
