# log2amqp [![Build Status](https://travis-ci.org/noblesamurai/node-log2amqp.svg?branch=master)](http://travis-ci.org/noblesamurai/node-log2amqp) [![NPM version](https://badge-me.herokuapp.com/api/npm/log2amqp.png)](http://badges.enytc.com/for/npm/log2amqp)

> Log JSON data to AMQP.

## Purpose

Use this for data dumps to AMQP.

## Usage

```js
const config = {
  source: 'my-source',
  amqp: { url: 'amqp://user:pw@myserver/blah', exchange: 'myexchange', routingKey: 'keyToRouteTo',
  schemaVersion: 3
 }
};
const AMQPLogger = require('log2amqp');
const logger = new AMQPLogger(config);
payload = { this: 'thing'};
logger.log('kind', payload);
logger.log('kind2', 'chris');
logger.flush({ meta: {/* ... */} }).then(() => {
  // [{ kind: payload }, { kind2: 'chris' }] is flushed to amqp routingKey (schemaVersion === 2)
  // OR
  /*
  [
    { type: 'kind',
     data: 'payload'
     },
    {
      type: 'kind2',
      data: 'chris'
    }
  ] is flushed to amqp routingKey (schemaVersion === 3)
  */
});
```

`meta` defines an object you want to apply to the whole logger
session. It will be included at the top level in the logged payload (same level
as `logs`). You may want to do this so you can e.g. easily index certain fields
in the JSON payload  (if you are writing from the queue to a DB table) or just if
there are fields that apply across the whole session the you want to normalise for
any reason.

## API

<a name="AMQPLogger"></a>

## AMQPLogger
Class to manage a single logging session that collects logs and flushes them to
 AMQP.

**Kind**: global class

* [AMQPLogger](#AMQPLogger)
    * [new AMQPLogger(config)](#new_AMQPLogger_new)
    * [.log(type, payload)](#AMQPLogger+log)
    * [.flush(opts)](#AMQPLogger+flush)

<a name="new_AMQPLogger_new"></a>

### new AMQPLogger(config)
- config
  - source - the source you are logging from
  - amqp.url - the url of the rabbitmq server
  - amqp.exchange - the exchange that will be asserted and used to publish to
  - amqp.routingKey - the RK to publish logs to
  - schemaVersion - schema version to use. Valid values are 2, 3.

| Param | Type |
| --- | --- |
| config | <code>Object</code> |

<a name="AMQPLogger+log"></a>

### amqpLogger.log(type, payload)
Add a log to the current state. Each call to log() results in a entry
added to the 'data' array placed at the top level of the published json.

**Kind**: instance method of [<code>AMQPLogger</code>](#AMQPLogger)

| Param | Type |
| --- | --- |
| type | <code>string</code> |
| payload | <code>object</code> |

<a name="AMQPLogger+flush"></a>

### amqpLogger.flush(opts)
opts.meta - This data is put in a top level 'meta' field in the published JSON.

**Kind**: instance method of [<code>AMQPLogger</code>](#AMQPLogger)

| Param | Type |
| --- | --- |
| opts | <code>object</code> |

Note: To regenerate this section from the jsdoc run `npm run docs` and paste
the output above.

## Installation

This module is installed via npm:

``` bash
$ npm install log2amqp
```

## Contributing

### Prerequisites

```
$ pip install pre-commit
```

### Installation

```
$ pre-commit install --install-hooks
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
