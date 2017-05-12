# Express-amqp-logger [![Build Status](https://secure.travis-ci.org/noblesamurai/express-amqp-logger.png?branch=master)](http://travis-ci.org/noblesamurai/express-amqp-logger) [![NPM version](https://badge-me.herokuapp.com/api/npm/express-amqp-logger.png)](http://badges.enytc.com/for/npm/express-amqp-logger)

> Log json data to amqp from express routes.

## Purpose

Use this for data dumps to amqp.

## Usage

```js
const config = { url: 'amqp://user:pw@myserver/blah', exchange: 'myexchange', routingKey: 'keyToRouteTo' };
const Logger = require('log2amqp')(config);
let logger = Logger();
payload = { this: 'thing'};
logger.log('kind', payload);
logger.log('kind2', 'chris');
logger.flush().then(() => {
  // [{ kind: payload }, { kind2: 'chris' }] is flushed to amqp routingKey
});
```

## API
<a name="main"></a>

## main(config)
Calling this with given config returns a function getLogger().
When called, getLogger will return an object:
{log, flush}
Call log to append logs.
Call flush to manually flush (you must do this.)

config

url - the url of the rabbitmq server
exchange - the exchange that will be asserted and used to publish to
routingKey - the RK to publish logs to

**Kind**: global function

| Param | Type |
| --- | --- |
| config | <code>Object</code> |

Note: To regenerate this section from the jsdoc run `npm run docs` and paste
the output above.

## Installation

This module is installed via npm:

``` bash
$ npm install express-amqp-logger
```
## License

The BSD License

Copyright (c) 2017, Tim Allen

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the Tim Allen nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

