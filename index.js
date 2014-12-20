'use strict';

var path = require('path')
  , request = require('request')
  , safejson = require('safejson')
  , MILLICORE_HOST = process.env['FH_MILLICORE']
  , HOSTS_PATH = '/box/srv/1.1/ide/apps/app/hosts'
  , ENV = process.env['FH_ENV'];

module.exports = function getUrl (guid, callback) {

  function onParse (err, json) {
    if (err) {
      callback('Failed to parse JSON from FH Instance Lookup', null);
    } else {
      try {
        var dev = json.hosts['development-url']
          , live = json.hosts['live-url']
          , host = (ENV === 'live') ? live : dev;

        callback(null, host);
      } catch (e) {
        callback('Unexpected JSON format from FH Instance Lookup', null);
      }
    }
  }

  function onResponse (err, res, body) {
    if (err) {
      callback(err, null);
    } else if (res.status !== 200) {
      callback('Non 200 status received from lookup');
    } else {
      safejson.parse(body, onParse);
    }
  }

  var body, url;

  url = 'https://'
  url += path.join(MILLICORE_HOST, HOSTS_PATH);

  body = JSON.stringify({
    instance: process.env['FH_INSTANCE'],
    widget: process.env['FH_WIDGET'],
    payload: {
      guid: guid,
      calling_guid: process.env['FH_WIDGET'],
      env: ENV
    }
  });

  request({
    url:  url,
    body: body,
    timeout: 10000,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json; charset=utf-8'
    }
  }, onResponse);
};
