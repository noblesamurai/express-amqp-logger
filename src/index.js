'use strict';

const debug = require('debug')('log2amqp');
const AMQP = require('amqp-wrapper');
const joi = require('joi');
const formatPayload = require('./payload');

async function getAmqp (config) {
  try {
    const amqp = AMQP(config.amqp);
    await amqp.connect();
    return amqp;
  } catch (err) {
    debug('Error connecting to amqp', err);
    return 'failed';
  }
}

function validateConfig (config) {
  joi.assert(config, joi.object({
    source: joi.string().required(),
    schemaVersion: joi.number().integer().valid([2, 3]).required()
  }).unknown(true));
}

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
 * schemaVersion - schema version to use
 */
function main (config) {
  validateConfig(config);
  const state = {
    amqp: getAmqp(config),
    config
  };

  return function getLogger () {
    const loggerState = {
      flushed: false,
      logs: []
    };
    return {
      log: log.bind(null, state, loggerState),
      flush: flush.bind(null, state, loggerState)
    };
  };
}

async function flush (state, loggerState, opts = {}) {
  const { meta } = opts;
  if (loggerState.flushed) throw new Error('Already flushed.');
  try {
    loggerState.flushed = true;
    const amqp = await state.amqp;
    if (amqp === 'failed') return;
    const payload = formatPayload(state.config, loggerState.logs);
    // FIXME(tim): Should handle this more nicely.
    if (meta) payload.meta = meta;
    await amqp.publish(state.config.amqp.routingKey, payload);
  } catch (err) {
    debug(err);
  } finally {
    // We explicitly set this to undefined just in case somehow there is a
    // reference back to the logger in the logged payload.
    // Such a circular reference would prevent garbage collection.
    loggerState.logs = undefined;
  }
}

function log (state, loggerState, type, payload) {
  if (loggerState.flushed) throw new Error('Already flushed.');
  const entry = {
    type,
    data: payload
  };
  loggerState.logs.push(entry);
}

module.exports = main;
