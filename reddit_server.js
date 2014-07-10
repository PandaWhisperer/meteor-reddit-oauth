RedditOauth = {};

var urlUtil = Npm.require('url');

OAuth.registerService('reddit', 2, null, function(query) {

  var response = getTokenResponse(query);
  var accessToken = response.accessToken;
  var identity = getIdentity(accessToken);

  var serviceData = {
    id: identity.name,
    accessToken: accessToken,
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
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'reddit'});
  if (!config)
    throw new ServiceConfiguration.ConfigError("Service not configured");

  var responseContent;
  try {
    // Request an access token
    responseContent = Meteor.http.post(
      "https://ssl.reddit.com/api/v1/access_token", {
        auth: [config.appId, config.secret].join(':'),
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: Meteor.absoluteUrl("_oauth/reddit?close")
        }
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
  var accessToken = parsedResponse.access_token;
  var expiresIn = parsedResponse.expires_in;

  if (!accessToken) {
    throw new Error("Failed to complete OAuth handshake with reddit " +
      "-- can't find access token in HTTP response. " + responseContent);
  }

  return {
    accessToken: accessToken,
    expiresIn: expiresIn
  };
};

var getIdentity = function (accessToken) {
  try {
    return Meteor.http.get("https://oauth.reddit.com/api/v1/me", {
        headers: { "Authorization": 'bearer ' + accessToken }
    }).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from reddit. " + err.message);
  }
};

RedditOauth.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret)
};
