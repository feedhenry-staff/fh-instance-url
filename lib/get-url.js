'use strict';

var log = require('./log')
  , util = require('./util')
  , assert = require('assert')
  , VError = require('verror')
  , requestUrl = require('./request-url')
  , cache = require('memory-cache')
  , CACHE_TIMEOUT = (1000 * 60 * 5); // 5 minute cache


/**
 * Resolves the a given opts.guid to a mBaaS service URL
 * @param  {Object}   opts
 * @param  {Function} callback
 */
module.exports = function getServiceUrl (opts, callback) {

  assert.equal(
    typeof opts,
    'object',
    'fh-instance-url.getUrl must be passed an Object containing options'
  );

  assert.equal(
    typeof opts.guid,
    'string',
    'fh-instance-url.getUrl must be passed an Object containing a "guid" String'
  );

  function onRemoteUrlRequestComplete (err, json) {
    if (err) {
      callback(err, null);
    } else if (json.hosts && json.hosts.url) {
      log.trace('received fh3 response, returnung url "%s"', json.hosts.url);
      // This is for domains with multiple mbaases, e.g dev, test, staging, live
      cache.put(opts.guid, json.hosts.url, CACHE_TIMEOUT);
      callback(null, json.hosts.url);
    } else {
      // Older domains only have dev and live
      log.trace('received fh2 response, attempting parse for json:', json);
      try {
        var dev = json.hosts['development-url']
          , live = json.hosts['live-url'];

        var host = (util.getEnv() === 'live') ? live : dev;

        cache.put(opts.guid, host, CACHE_TIMEOUT);

        callback(null, host);
      } catch (e) {
        callback(
          new VError(
            e,
            'Unexpected JSON format from FH Instance Lookup %j',
            json
          ),
          null
        );
      }
    }
  }

  if (cache.get(opts.guid)) {
    log.trace('returning host for guid "%s" from cache', opts.guid);
    callback(null, cache.get(opts.guid));
  } else if (util.isLocal()) {
    log.trace(
      'running locally. load service mappings for guid "%s"',
      opts.guid
    );
    // developing locally, try to use the service map
    util.getServiceMap(function onMapLoaded (err, map) {
      if (err) {
        // Invalid fhconfig or FH_SERVICE_MAP
        callback(err);
      } else if (map && map[opts.guid]) {
        // Found a match for the guid provided in FH_SERVICE_MAP or fhconfig
        callback(null, map[opts.guid]);
      } else if (map && !map[opts.guid]) {
        // Map was found, but no entry for this guid
        callback(
          new VError('%s not found in FH_SERVICE_MAP or fhconfig', opts.guid),
          null
        );
      } else {
        // No map found, make a remote request
        requestUrl(opts, onRemoteUrlRequestComplete);
      }
    });
  } else {
    // Not developing locally, need to make a request
    requestUrl(opts, onRemoteUrlRequestComplete);
  }
};
