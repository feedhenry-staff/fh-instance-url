'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , proxyquire = require('proxyquire').noCallThru();

describe(__filename, function () {
  var mod, stubs, logStub, envStubs;

  beforeEach(function () {
    require('clear-require').all();

    logStub = {
      trace: sinon.stub(),
      warn: sinon.stub()
    };

    envStubs = {
      asString: sinon.stub(),
      asJson: sinon.stub()
    };

    stubs = {
      './config': {},
      'env-var': sinon.stub().returns(envStubs),
      'fh-bunyan': {
        getLogger: function () {
          return logStub;
        }
      },
    };

    mod = proxyquire('../lib/util', stubs);
  });


  describe('#getServiceMap', function () {

    it('should return an object from env vars', function (done) {
      envStubs.asString.returns('{"a":"b"}');
      envStubs.asJson.returns({a:'b'});

      mod.getServiceMap(function (err, map) {
        expect(err).to.not.exist;
        expect(map).to.be.an('object');
        expect(map).to.have.property('a');
        expect(map.a).to.equal('b');
        done();
      });
    });

    it('should return an error due to json parsing', function (done) {
      envStubs.asJson.throws(new Error('parse fail'));
      envStubs.asString.returns('valid');
      mod.getServiceMap(function (err, map) {
        expect(err).to.exist;
        expect(map).to.not.exist;
        done();
      });
    });

    it('should return items from fhconfig', function (done) {
      require('clear-require').all();
      delete stubs['./config'];
      mod = proxyquire('../lib/util', stubs);

      mod.getServiceMap(function (err, map) {
        expect(err).to.not.exist;
        expect(map).to.exist;
        expect(map).to.deep.equal({
          '48fhsf6mxzlyqi3ffbpkfh38': 'http://127.0.0.1:8001/'
        });
        done();
      });
    });

    it('should fail due to bad fhconfig', function (done) {
      require('clear-require').all();
      stubs['./config'] = {
        services: 'nope'
      };
      mod = proxyquire('../lib/util', stubs);

      mod.getServiceMap(function (err) {
        expect(err).to.exist;
        expect(err.toString()).to.contain(
          'failed to parse fhconfig service mappings'
        );
        done();
      });
    });

    it('should handle no mappings being found', function (done) {
      mod.getServiceMap(function (err, map) {
        expect(err).to.not.exist;
        expect(map).to.not.exist;
        done();
      });
    });
  });


  describe('#genHost', function () {
    it('should throw an assertion error - no domain', function () {
      envStubs.asString.returns('');

      expect(function () {
        mod.genHost();
      }).to.throw('AssertionError');
    });

    it('should throw an assertion error - protocol included', function () {
      envStubs.asString.returns('http://test.us.feedhenry.com');
      expect(function () {
        mod.genHost();
      }).to.throw('AssertionError');
    });

    it('should return a https url', function () {
      envStubs.asString.returns('test.us.feedhenry.com');

      var res = mod.genHost();

      expect(res).to.equal(
        'https://test.us.feedhenry.com/box/srv/1.1/ide/apps/app/hosts'
      );
    });
  });


  describe('#getServiceCallHeaders', function () {
    it('should return service call headers from env vars', function () {

      stubs['env-var'].withArgs('FH_USE_LOCAL_DB').returns({
        asString: sinon.stub().returns('')
      });

      stubs['env-var'].withArgs('FH_WIDGET').returns({
        asString: sinon.stub().returns('FH_WIDGET')
      });

      stubs['env-var'].withArgs('FH_APP_API_KEY').returns({
        asString: sinon.stub().returns('FH_APP_API_KEY')
      });

      var headers = mod.getServiceCallHeaders();

      expect(headers).to.have.property('x-fh-auth-app');
      expect(headers).to.have.property('x-request-with');
      expect(headers['x-fh-auth-app']).to.equal('FH_APP_API_KEY');
      expect(headers['x-request-with']).to.equal('FH_WIDGET');
    });

    it('should get service headers from fhconfig', function () {
      require('clear-require').all();
      stubs['./config'] = {
        apiKey: '123',
        appId: '321'
      };
      mod = proxyquire('../lib/util', stubs);

      var headers = mod.getServiceCallHeaders();

      expect(headers).to.have.property('x-fh-auth-app');
      expect(headers).to.have.property('x-request-with');
      expect(headers['x-fh-auth-app']).to.equal('123');
      expect(headers['x-request-with']).to.equal('321');
    });
  });


  describe('#getEnv', function () {
    it('should return env and not print a warning', function () {
      envStubs.asString.returns('test');

      expect(mod.getEnv()).to.equal('test');
    });

    it('should return env and print a warning', function () {
      envStubs.asString.returns('');

      expect(mod.getEnv()).to.equal('dev');
    });
  });


  describe('#getDomain', function () {
    it('should return domain from fhconfig', function () {
      stubs['env-var'].withArgs('FH_USE_LOCAL_DB').returns({
        asString: sinon.stub().returns('true')
      });

      stubs['./config'].domain = '123';

      expect(mod.getDomain()).to.equal('123');
    });
  });

});
