'use strict';

const debug = require('debug')('log2amqp');
const AMQP = require('amqp-wrapper');

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
 *
 * url - the url of the rabbitmq server
 * exchange - the exchange that will be asserted and used to publish to
 * routingKey - the RK to publish logs to
 */
function main (config) {
  const connected = Promise.resolve().then(function () {
    return AMQP(config);
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
        return amqp.publish(config.routingKey, logs)
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
