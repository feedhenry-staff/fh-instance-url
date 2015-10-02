FeedHenry Instance URL
======================

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
var iurl = require('fh-instance-url'),
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

// Can also do iurl.getUrl
iurl(GUID, urlCallback);
```

## Alternate Usage
When developing locally the above code would not work unelss you copied and set 
the FH_MILLICORE environment variable from the target domain on your 
development machine/project. To use this module without setting the env var you 
can do the following:

```javascript
var fhurl = require('fh-instance-url');
var request = require('request');

fhurl.getUrl({
	guid: GUID,
	domain: 'subdomain-name.feedhenry.com'
}, function (err, url) {
	if (err) {
		// Oh noes...
	} else {
		var h = fhurl.getServiceCallHeaders();

		// Add in more headers
		h['content-type'] = 'application/json';

		request({
			url: url,
			headers: h
		}, console.log.bind(console));
	}
});

```

## API

#### getUrl(params, callback)
Get the URL for a service based on the passed GUID or params. Params can be a 
String (the GUID), or an object with the properties _guid_ and _domain_.

#### getServiceCallHeaders()
Returns an object containing headers required to make a service request.


## Contributing
No strict guidelines. Just run the tests before making a pull request, and add 
new ones if required. You can run tests by cloning locally and running 
_npm test_ in the project directory. 

Don't worry about the use of [jscs](https://github.com/jscs-dev/node-jscs) here,
it's just a trial of the tool more than anything.

This module doesn't cache the result at present but doing so could be 
beneficial. The $fh.service SDK doensn't cache the URL, so maybe this 
shouldn't either and you can do so instead at the application layer.