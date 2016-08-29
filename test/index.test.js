'use strict';

var expect = require('chai').expect
  , mod = require('../lib/index.js')

describe(__filename, function () {

  describe('#getUrl', function () {

    it('should be exported', function () {
      expect(mod.getUrl).to.be.a('function');
    });

  });
  describe('#getServiceCallHeaders', function () {

    it('should be exported', function () {
      expect(mod.getServiceCallHeaders).to.be.a('function');
    });

  });

});
