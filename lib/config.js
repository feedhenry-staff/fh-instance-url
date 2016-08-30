'use strict';

var path = require('path')
  , log = require('./log');

try {
  module.exports = require(
    path.join(process.cwd(), 'fhconfig.json')
  );
} catch (e) {
  module.exports = {};
  log.warn(
    'fhconfig.json not found in project root at %s',
    path.join(process.cwd(), 'fhconfig.json')
  );
}
