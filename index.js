const debug = require('debug')('express-amqp-logger');

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
    return require('amqp-wrapper')(config);
  }).then(function (amqp) {
    return amqp.connect().then(function () { return amqp; });
  }).catch(function (err) {
    debug('Error connecting to amqp', err);
    return 'failed';
  });

  return function getLogger () {
    let flushed = false;
    const logs = [];

    function flush () {
      if (flushed) throw new Error('Already flushed.');
      flushed = true;
      return connected.then(function (amqp) {
        if (amqp === 'failed') return Promise.resolve();
        return amqp.publish(config.routingKey, logs).catch(console.error);
      });
    }

    function log (type, payload) {
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
