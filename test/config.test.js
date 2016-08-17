'use strict';

var expect = require('chai').expect;

describe(__filename, function () {

  beforeEach(function () {
    require('clear-require').all();
  });

  it('should return a real config', function () {
    var cfg = require('../lib/config');
    expect(cfg.domain).to.be.a('string');
  });

  it('should return an empty object', function () {
    var proxyquire = require('proxyquire').noCallThru();
    var cfg = proxyquire('../lib/config', {
      path: {
        join: require('sinon').stub()
      }
    });
    expect(cfg).to.be.empty;
  });
});
