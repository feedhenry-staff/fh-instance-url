'use strict';

var log = require('./log')
  , util = require('./util')
  , VError = require('verror')
  , request = require('request');

module.exports = function requestUrl (opts, callback) {
  var host = util.genHost(opts);

  function onUrlRequestResponse (err, res, body) {
    if (err) {
      callback(
        new VError(err, 'request to %s for mBaaS URL failed', host),
        null
      );
    } else if (res.statusCode !== 200) {
      callback(
        new VError(
          'request to %s for mBaaS URL failed with status %s and response %j',
          host,
          res.statusCode,
          body
        ),
        null
      );
    } else {
      callback(null, body);
    }
  }

  var reqOpts = {
    url: host,
    json: true,
    timeout: 15000,
    body: {
      calling_guid: util.getWidget(),
      env: util.getEnv(),
      guid: opts.guid
    }
  };

  log.trace('making request for mbaas host with opts', reqOpts);

  request.post(reqOpts, onUrlRequestResponse);
};
