'use strict';

var proxyquire = require('proxyquire')
  , assert = require('assert');

var FH_MILLICORE = process.env['FH_MILLICORE'] = 'FH_MILLICORE'
  , FH_INSTANCE = process.env['FH_INSTANCE'] = 'FH_INSTANCE'
  , FH_WIDGET = process.env['FH_WIDGET'] = 'FH_WIDGET'
  , FH_ENV = process.env['FH_ENV'] = 'FH_ENV'
  , OK_RES_GUID = 'OK_RES_GUID'
  , MALFORMED_RES_GUID = 'MALFORMED_RES_GUID'
  , UNEXPECTED_RES_GUID = 'UNEXPECTED_RES_GUID'
  , DEV_URL = 'http://feedhenry.com/dev'
  , VALID_RESPONSE = {
    hosts: {
      'development-url': DEV_URL,
      'live-url': 'http://feedhenry.com/live'
    }
  };

var iurl = proxyquire('../index.js', {
  request: function (opts, callback) {
    var guid  = JSON.parse(opts.body).guid;

    if (guid === OK_RES_GUID) {
      callback(null, {
        statusCode: 200
      }, JSON.stringify(VALID_RESPONSE));
    } else if (guid === MALFORMED_RES_GUID) {
      callback(null, {
        statusCode: 200
      }, '{a;}');
    } else if (guid === UNEXPECTED_RES_GUID) {
      callback(null, {
        statusCode: 200
      }, '{}');
    } else {
      throw new Error('Test has no matching response!');
    }
  }
});

describe('fh-instance-url', function () {

  describe('#getServiceCallHeaders', function () {

    it('Should return values for headers', function () {
      var headers = iurl.getServiceCallHeaders();

      assert.equal(headers['x-fh-auth-app'], '');
      assert.equal(headers['x-request-with'], 'FH_WIDGET');
    });

    it('Should return env var values for headers', function () {
      process.env.FH_APP_API_KEY = '123';

      var headers = iurl.getServiceCallHeaders();

      assert.equal(headers['x-fh-auth-app'], '123');
      assert.equal(headers['x-request-with'], 'FH_WIDGET');

      process.env.FH_APP_API_KEY = undefined;
      process.env.FH_WIDGET = undefined;
    });

  });

  describe('#getUrl', function () {

    it('Should work as expected with valid inputs', function () {
      iurl(OK_RES_GUID, function (err, url) {
        assert.equal(err, null);
        assert.equal(typeof url, 'string');
      });
    });

    it('Should handle a malformed response', function () {
      iurl(MALFORMED_RES_GUID, function (err, url) {
        assert.notEqual(err, null);
        assert.equal(
          err.toString(),
          'Error: Failed to parse JSON from FH Instance Lookup'
        );
        assert.equal(url, null);
      });
    });

    it('Should handle an invalid JSON response', function () {
      iurl(UNEXPECTED_RES_GUID, function (err, url) {
        assert.notEqual(err, null);
        assert.equal(
          err.toString(),
          'Error: Unexpected JSON format from FH Instance Lookup'
        );
        assert.equal(url, null);
      });
    });

    it('Should handle local development', function () {
      process.env.FH_SERVICE_MAP = JSON.stringify({
        localtest: 'http://localhost:8001'
      });
      iurl('localtest', function (err, url) {
        assert.equal(err, null);
        assert.equal(typeof url, 'string');
        assert.equal( url, 'http://localhost:8001');
      });
    });

  });

});
