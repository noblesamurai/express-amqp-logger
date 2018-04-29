'use strict';

const debug = require('debug')('log2amqp');
const AMQP = require('amqp-wrapper');
const uuid = require('uuid/v1');

/**
 * @param {Object} config
 * @description
 *
 * Calling this with given config returns a function getLogger().
 * When called, getLogger will return an object:
 * {log, flush}
 * Call log to append logs.
 * Call flush to manually flush (you must do this.)
 *
 * config
 * source - the source you are logging from
 * amqp.url - the url of the rabbitmq server
 * amqp.exchange - the exchange that will be asserted and used to publish to
 * amqp.routingKey - the RK to publish logs to
 */
function main (config) {
  const connected = Promise.resolve().then(function () {
    return AMQP(config.amqp);
  }).then(function (amqp) {
    return amqp.connect().then(function () { return amqp; });
  }).catch(function (err) {
    debug('Error connecting to amqp', err);
    return 'failed';
  });

  return function getLogger () {
    let flushed = false;
    let logs = [];

    function flush () {
      if (flushed) throw new Error('Already flushed.');
      flushed = true;
      return connected.then(function (amqp) {
        if (amqp === 'failed') return Promise.resolve();
        return amqp.publish(config.amqp.routingKey, {
          id: uuid(),
          timestamp: Date.now(),
          'log2amqp-schema-version': '2.0.0',
          source: config.source,
          logs })
          .catch(console.error)
          .then(() => {
            // We explicitly set this to undefined just in case somehow there is a
            // reference back to the logger in the logged payload.
            // Such a circular reference would prevent garbage collection.
            logs = undefined;
          });
      });
    }

    function log (type, payload) {
      if (flushed) throw new Error('Already flushed.');
      const entry = {};
      entry[type] = payload;
      logs.push(entry);
    }

    return {
      log: log,
      flush: flush
    };
  };
}

module.exports = main;
