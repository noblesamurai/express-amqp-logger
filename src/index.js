'use strict';

const debug = require('debug')('log2amqp');
const AMQP = require('amqp-wrapper');
const joi = require('joi');
const formatPayload = require('./payload');

async function getAMQP (config) {
  try {
    const amqp = AMQP(config);
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
class AMQPLogger {
  constructor (config) {
    validateConfig(config);
    this.config = config;
    this.amqp = getAMQP(config.amqp);
    this.flushed = false;
    this.logs = [];
  }

  async flush (opts = {}) {
    const { meta } = opts;
    if (this.flushed) throw new Error('Already flushed.');
    try {
      this.flushed = true;
      const amqp = await this.amqp;
      if (amqp === 'failed') return;
      const payload = formatPayload(this.config, this.logs);
      if (meta) payload.meta = meta;
      await amqp.publish(this.config.amqp.routingKey, payload);
    } catch (err) {
      debug(err);
    } finally {
      // We explicitly set this to undefined just in case somehow there is a
      // reference back to the logger in the logged payload.
      // Such a circular reference would prevent garbage collection.
      this.logs = undefined;
    }
  }

  log (type, payload) {
    if (this.flushed) throw new Error('Already flushed.');
    const entry = {
      type,
      data: payload
    };
    this.logs.push(entry);
  }
}

module.exports = AMQPLogger;
