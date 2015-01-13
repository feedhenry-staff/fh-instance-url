# FeedHenry Instance URL
Retreieves the URL of a Service or Cloud Application in the FeedHenry platform.

Pretty much a lift of the $fh.service API internals that resolves the service 
URL [here](https://github.com/fheng/fh-mbaas-api/blob/master/lib/act.js). This 
might be a public API at some point but for now this is a handy work around.

## Usage
Very useful if you want the URL without having to hardcode it and would like to 
manually call a service and chain calls to it using pipes rather than the 
FeedHenry Service or Act APIs.

The target environment is determined by matching it with the current env, 
so a DEV Node.js App will get the DEV Service URL.


As an example you could couple this with Keyang's 
[HTML to PDF Converter](https://github.com/feedhenry-staff/fh-htmltopdf).

```javascript
var instanceUrl = require('fh-instance-url'),
	request = require('request'),
	url = require('url');

function urlCallback (err, serviceUrl) {
	if (err) {
		// Deal with it -_-
	} else {
		var converterUrl = url.resolve(serviceUrl, '/api/htmltopdf');

		fs.createReadStream('before.html')
			.pipe(request.post(converterUrl))
			.pipe(fs.createWriteStream("after.pdf"));
	}
}

instanceUrl(GUID, urlCallback); <= The Magic!
```

## Alternate Usage
When developing locally the above code would not work unelss you copied and set 
the FH_MILLICORE environment variable from the target domain on your 
development machine/project. To use this module without setting the env var you 
can do the following:

```javascript
var instanceUrl = require('fh-instance-url');

instanceUrl({
	guid: GUID,
	domain: 'yourdomainprefix' // Leave out the .feedhenry.com part
}, urlCallback); <= The Magic!

```

## Contributing
No strict guidelines. Just run the tests before making a pull request, and add 
new ones if required. You can run tests by cloning locally and running 
_npm test_ in the project directory. 

Don't worry about the use of [jscs](https://github.com/jscs-dev/node-jscs) here,
it's just a trial of the tool more than anything.

This module doesn't cache the result at present but doing so could be 
beneficial. The $fh.service SDK doensn't cache the URL, so maybe this 
shouldn't either.