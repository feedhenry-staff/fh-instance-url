'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , proxyquire = require('proxyquire');

describe(__filename, function () {
  var mod, stubs, HOST, GUID;

  beforeEach(function () {
    GUID = '1234567890';

    HOST = 'http://www.a-host-url.com';

    stubs = {
      './util': {
        genHost: sinon.stub().returns(HOST)
      },
      'request': {
        post: sinon.stub()
      }
    };
    mod = proxyquire('../lib/request-url', stubs);
  });


  describe('#getServiceUrl', function () {
    it('should handle a non 200 response', function (done) {
      stubs['request'].post.yields(null, {statusCode: 500}, null);

      mod({
        guid: GUID
      }, function (err, body) {
        expect(err).to.exist;
        expect(body).to.not.exist;
        expect(err.toString()).to.contain('failed with status');
        done();
      });
    });

    it('should handle a system/communication error', function (done) {
      stubs['request'].post.yields(new Error('connection issue!'), null);

      mod({
        guid: GUID
      }, function (err, body) {
        expect(err).to.exist;
        expect(body).to.not.exist;
        expect(err.toString()).to.contain('connection issue');

        done();
      });
    });

    it('should handle a return data if response is a 200', function (done) {
      var response = {
        url: '123'
      };
      stubs['request'].post.yields(null, {statusCode:200}, response);

      mod({
        guid: GUID
      }, function (err, body) {
        expect(err).to.not.exist;
        expect(body).to.equal(response);
        done();
      });
    });
  });

});
