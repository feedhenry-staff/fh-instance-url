'use strict';

var path = require('path')
  , request = require('request')
  , safejson = require('safejson')
  , MILLICORE_HOST = process.env['FH_MILLICORE']
  , HOSTS_PATH = '/box/srv/1.1/ide/apps/app/hosts'
  , ENV = process.env.FH_ENV
  , WIDGET = process.env.FH_WIDGET;

function genHost (host) {
  if (host.indexOf('feedhenry.com') === -1) {
    return host.concat('.feedhenry.com');
  }

  return host;
}

module.exports = function getUrl (opts, callback) {

  function onParse (err, json) {
    if (err) {
      callback(
        new Error('Failed to parse JSON from FH Instance Lookup'),
        null
      );
    } else if (json.hosts && json.hosts.url) {
      callback(null, json.hosts.url);
    } else {
      try {
        var dev = json.hosts['development-url']
          , live = json.hosts['live-url']
          , host = (ENV === 'live') ? live : dev;

        callback(null, host);
      } catch (e) {
        callback(
          new Error('Unexpected JSON format from FH Instance Lookup'),
          null
        );
      }
    }
  }

  function onResponse (err, res, body) {
    if (err) {
      callback(err, null);
    } else if (res.statusCode !== 200) {
      callback(new Error('Non 200 status received from lookup'), null);
    } else {
      safejson.parse(body, onParse);
    }
  }

  var body, url, hostingDomain;

  // Allow user specify the host (local dev for example)
  if (typeof opts !== 'string') {
    hostingDomain = (opts.domain) ? genHost(opts.domain) : MILLICORE_HOST;
  } else {
    hostingDomain = MILLICORE_HOST;
  }

  url = 'https://'
  url += path.join(hostingDomain, HOSTS_PATH);

  body = JSON.stringify({
    calling_guid: WIDGET,
    env: ENV,
    guid: (typeof opts.guid !== 'undefined') ? opts.guid : opts
  });

  request({
    url:  url,
    body: body,
    timeout: 10000,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }, onResponse);
};
