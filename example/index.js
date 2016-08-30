'use strict';

// Simulate local development
process.env.FH_USE_LOCAL_DB = 'true';

// Uncomment to simulate a real environment if you have one.
// You need to comment out the FH_USE_LOCAL_DB line above
// process.env.FH_MILLICORE = 'not-a-domain.feedhenry,com'
// process.env.FH_ENV = 'dev'

var fhurl = require('../lib');
var log = require('fh-bunyan').getLogger('example');

fhurl.getUrl({
  guid: '48fhsf6mxzlyqi3ffbpkfh38'
}, function onUrl (err, url) {
  if (err) {
    log.error('failed to get url', err);
  } else {
    log.info('resolved url to "%s" from fhconfig.json', url);
  }
});
