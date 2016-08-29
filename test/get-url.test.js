'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , proxyquire = require('proxyquire');

describe(__filename, function () {
  var mod, stubs;

  beforeEach(function () {

    require('clear-require').all();

    stubs = {
      'memory-cache': {
        put: sinon.stub(),
        get: sinon.stub().returns(null),
      },
      './request-url': sinon.stub(),
      './util': {
        isLocal: sinon.stub().returns(true),
        getEnv: sinon.stub(),
        getServiceMap: sinon.stub()
      }
    };

    mod = proxyquire('../lib/get-url', stubs);
  });

  it('should return an error due to missing opts', function () {
    expect(function () {
      mod();
    }).to.throw(
      'AssertionError: fh-instance-url.getUrl must be passed an Object'
    );
  });

  it('should return an error due to missing opts.guid', function () {
    expect(function () {
      mod({});
    }).to.throw(
      'AssertionError: fh-instance-url.getUrl must be passed an Object' +
      ' containing a "guid" String'
    );
  });

  it('should return an error due to service map parsing', function (done) {
    stubs['./util'].getServiceMap.yields(new Error('oops, parse failed'));

    mod({
      guid: '123'
    }, function (err, url) {
      expect(err).to.exist;
      expect(err.toString()).to.contain('oops, parse failed');
      expect(url).to.not.exist;
      done();
    });
  });

  it('should return error - url not in mapping', function (done) {
    stubs['./util'].getServiceMap.yields(null, {});

    mod({
      guid: '123'
    }, function (err, url) {
      expect(err).to.exist;
      expect(url).to.not.exist;
      done();
    });
  });

  it('should return the url from mappings', function (done) {
    var url = 'http://test.com';
    var key = '123';
    var map = {};
    map[key] = url;

    stubs['./util'].getServiceMap.yields(null, map);

    mod({
      guid: '123'
    }, function (err, url) {
      expect(err).to.not.exist;
      expect(url).to.equal(url);
      done();
    });
  });

  it('should return error due to http call failure', function (done) {
    stubs['./request-url'].yields(new Error('http failed'), null);
    stubs['./util'].getServiceMap.yields(null, null);

    var opts = {
      guid: '123',
      domain: 'test.url.com'
    };

    mod(opts, function (err, url) {
      expect(err).to.exist;
      expect(err.toString()).to.contain('http failed');
      expect(url).to.not.exist;
      expect(stubs['./request-url'].getCall(0).args[0]).to.eql(opts);
      done();
    });
  });

  it('should return dev url for fh2 domains', function (done) {
    var url = 'test';

    stubs['./request-url'].yields(null, {
      hosts: {
        'development-url': url
      }
    });

    stubs['./util'].getServiceMap.yields(null, null);

    stubs['./util'].getEnv.returns('dev');

    var opts = {
      guid: '123',
      domain: 'test.url.com'
    };

    mod(opts, function (err, url) {
      expect(err).to.not.exist;
      expect(url).to.equal(url);
      expect(stubs['./request-url'].getCall(0).args[0]).to.eql(opts);
      expect(stubs['memory-cache'].put.called).to.be.true;
      done();
    });
  });

  it('should return error due to bad fh2 json from http', function (done) {
    stubs['./request-url'].yields(null, {
      not_hosts: {
        a: {
          b: 'c'
        }
      }
    });

    stubs['./util'].isLocal.returns(false);

    stubs['./util'].getServiceMap.yields(null, null);

    var opts = {
      guid: '123',
      domain: 'test.url.com'
    };

    mod(opts, function (err, url) {
      expect(err).to.exist;
      expect(url).to.equal(url);
      expect(stubs['./request-url'].getCall(0).args[0]).to.eql(opts);
      done();
    });
  });

  it('should return url for fh3 domains', function (done) {
    var retUrl = 'fh-url';
    stubs['./request-url'].yields(null, {
      hosts: {
        url: retUrl
      }
    });

    stubs['./util'].getServiceMap.yields(null, null);

    var opts = {
      guid: '123',
      domain: 'test.url.com'
    };

    mod(opts, function (err, url) {
      expect(err).to.not.exist;
      expect(stubs['./request-url'].getCall(0).args[0]).to.eql(opts);
      expect(url).to.equal(retUrl);
      expect(stubs['memory-cache'].put.called).to.be.true;
      done();
    });
  });

  it('should return url for fh3 domains from cache', function (done) {
    var url = 'host.url.com';

    stubs['memory-cache'].get.returns(url);

    var opts = {
      guid: '123',
      domain: 'test.url.com'
    };

    mod(opts, function (err, res) {
      expect(err).to.not.exist;
      expect(res).to.equal(url);
      done();
    });
  });

});
