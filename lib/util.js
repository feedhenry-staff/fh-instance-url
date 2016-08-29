'use strict';

var env = require('env-var')
  , url = require('url')
  , log = require('fh-bunyan').getLogger(__filename)
  , assert = require('assert')
  , VError = require('verror')
  , pkg = require('./config');


/**
 * Returns the app api key required to make a service request
 * @return {String}
 */
function getApiKey () {
  if (isLocal() && pkg.apiKey) {
    log.trace('using apiKey in fhconfig');
    return pkg.apiKey;
  } else {
    log.trace('using api key in FH_APP_API_KEY env var');
    return env('FH_APP_API_KEY').asString();
  }
}


/**
 * Returns the widget id required to make a service request
 * @return {String}
 */
var getWidget = exports.getWidget = function getWidget () {
  if (isLocal() && pkg.appId) {
    log.trace('using appId key in fhconfig');
    return pkg.appId;
  } else {
    log.trace('using appId in FH_WIDGET env var');
    return env('FH_WIDGET').asString();
  }
};


/**
 * Determine if the application is deployed on RHMAP, or locally
 * @param  {Object} env process.env Object
 * @return {Boolean}
 */
var isLocal = exports.isLocal = function isLocal () {
  // This should be suffificient to determine are we running locally or not, but
  // might require more considerations since it is a little crude
  return (
    env('FH_USE_LOCAL_DB').asString() ||
    !env('FH_MILLICORE').asString() ||
    !env('FH_ENV').asString()
  );
};

/**
 * Returns data in the FH_SERVICE_MAP format if it exists in fhconfig or the
 * older FH_SERVICE_MAP env var
 * @return Object
 */
exports.getServiceMap = function getServiceMap (callback) {
  var err = null
    , ret = null;

  if (pkg && typeof pkg.services === 'object') {
    log.trace('fhconfig "services" entry found. using it for service mapping');
    ret = {};
    Object.keys(pkg.services).forEach(function (guid) {
      ret[guid] = pkg.services[guid].devUrl;
    });
  } else if (env('FH_SERVICE_MAP').asString()) {
    log.trace(
      'fhconfig "services" entry not found. using FH_SERVICE_MAP instead'
    );
    try {
      ret = env('FH_SERVICE_MAP').asJson();
    } catch (e) {
      err = new VError(e, 'cannot parse FH_SERVICE_MAP environment variable');
    }
  } else {
    log.warn(
      'no service mappings found as fhconfig.services, or FH_SERVICE_MAP'
    );
  }

  callback(err, ret);
};


/**
 * Normalise a host string to {HOST}.feedhenry.com
 * @param  {String} host
 * @return {String}
 */
exports.genHost = function genHost () {
  var ret = exports.getDomain();

  assert(
    ret && ret.length >= 0,
    'fhconfig.json domain property must be provided, or FH_MILLICORE env var ' +
    'must be set on the system'
  );

  assert.notEqual(
    ret.indexOf('http'),
    0,
    'fhconfig.json "domain" must not contain a protcol string, just the host' +
    ', i.e "http://" or "https://"'
  );

  return url.format({
    host: ret,
    protocol: 'https:',
    pathname: '/box/srv/1.1/ide/apps/app/hosts'
  });
};


/**
 * Returns the domain this application is running on.
 *
 * Locally it will use the domain in the fhconfig, else it'll check the
 * environment variables, be sure they match to avoid headaches
 * @return {String}
 */
exports.getDomain = function () {
  var ret = null;

  if (isLocal() && pkg.domain) {
    log.trace('using fhconfig "domain" for host generation');
    ret = pkg.domain;
  } else {
    log.trace('using FH_MILLICORE for host generation');
    ret = env('FH_MILLICORE').asString();
  }

  return ret;
};


/**
 * Returns service call headers that are required for secure calls
 * @return {Object}
 */
exports.getServiceCallHeaders = function () {
  var ret = {
    'x-fh-auth-app': getApiKey(),
    'x-request-with': getWidget()
  };

  log.trace('generated service call headers as', ret);

  return ret;
};


/**
 * Return the FH_ENV variable that indicates the env we're running in
 * @return {String}
 */
exports.getEnv = function getEnv () {
  var e = env('FH_ENV').asString();

  if (!e) {
    log.warn(
      'FH_ENV environment variable not set. this is OK during local ' +
      'development, and will default to "dev" unless you need to set it ' +
      'explicitly e.g "export FH_ENV=rht-dev" or similar in bash'
    );

    return 'dev';
  } else {
    return e;
  }
};
