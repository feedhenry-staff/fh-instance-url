FeedHenry Instance URL
======================

Retrieves the URL of an MBaaS Service or Cloud Application in the FeedHenry
platform.

## Usage
In the example below we get a URL for our MBaaS, then make a request to get some
data it exposes.

```javascript
var fhurl = require('fh-instance-url');

fhurl.getUrl({
  guid: '48fhsf6mxzlyqi3ffbpkfh38'
}, function onUrl (err, serviceUrl) {
  if (err) {
    // Something went wrong, perhaps a bad guid?
  } else {
    // Can make a request to the URL!
  }
});
```

## Behaviours

#### Environment
The target environment is determined by matching it with the current env,
so a DEV Node.js Cloud Application will get the DEV Service URL if making a call
using this module. This uses *process.env.FH_ENV* under the hood.

#### Local Development
Developing locally is defined as running your application with the
FH_USE_LOCAL_DB environment variable set to "true", or **not** having
FH_MILLICORE or FH_ENV set since these are always set in RHMAP containers.

When developing locally this module will first check for the existence of an
*fhconfig.json* file in the root of your project directory to resolve the
provided guid for the lookup to a URL of your choosing. More details for
this _fhconfig_ JSON file are provided below. If you'd rather use
*FH_SERVICE_MAP* which is the default for _$fh.service_ lookups that will
work so long as you do not have an *fhconfig.json* file in your project root.

If no mappings are provided i.e *FH_SERVICE_MAP* is not defined and
_fhconfig.json_ is not present, we will attempt to use the Red Hat Mobile APIs
to resolve the URL (this is what happens when code is deployed on RHAMP). To
do this you must set the following environment variables locally:

* FH_MILLICORE
* FH_ENV
* FH_WIDGET

These variables can be found in a the Environment Variables tab of your Cloud
Application.


## API

#### getUrl(params, callback)
Get the URL for a service based on the passed GUID or params. Params can be a
String (the GUID), or an object with the properties _guid_ and _domain_.

#### getServiceCallHeaders()
Returns an object containing headers required to make a service request. You
can merge this with another Object to make a finalised headers Object with your
headers plus RHMAP headers.


## fhconfig.json

The fhconfig.json is a general configuration file we can use to manage local
development when using _fh-instance-url_.

Here's a sample:

```json
{
  "domain": "your-domain.feedhenry.com",
  "appId": "the id of this app from the app details screen",
  "apiKey": "the api key from the app details screen",
  "services": {
    "48fhsf6mxzlyqi3ffbpkfh38": {
      "devUrl": "http://127.0.0.1:8001/",
      "name": "MY_AUTH_SERVICE"
    }
  }
}
```

And a description of the keys:

#### domain
The domain your application is/will run on.

#### services
Contains keys (guids of apps) that manage MBaaS Service interaction.

#### services[GUID]
Contains information related to specific MBaaS components identified by their,
AppID or GUID.

#### services[GUID].name
A name you might assign to identify an MBaaS. Does not have to match the name
in the RHMAP Studio.

#### services[GUID].devUrl
Used to point MBaaS requests to a custom host during local development.


## CHANGELOG

* 1.1.0 - Add improved trace logging for debugging support. Reduce install
size by limiting files included in package.
* 1.0.0 - Introduce fhconfig.json support. Rewrite module and improve testing.
* 0.X.Y - Here be dragons


## Contributing
No strict guidelines. Just run the tests before making a pull request, and add
new ones if required. You can run tests by cloning locally and running
_npm test_ in the project directory.

## Contributors
* evanshortiss
* TinyExplosions
* jimdillon
* Crosbie
