const joi = require('joi');
const uuid = require('uuid/v1');

module.exports = function formatPayload (config, logs) {
  joi.assert(config, joi.object({
    source: joi.string(),
    schemaVersion: joi.number().integer()
  }).unknown(true));

  const payload = {
    id: uuid(),
    timestamp: Date.now(),
    source: config.source
  };
  if (config.schemaVersion === 2) {
    const _logs = logs;
    Object.assign(payload, {
      'log2amqp-schema-version': '2.1.0',
      logs: _logs.map(l => {
        const ret = {};
        ret[l.type] = l.data;
        return ret;
      })
    });
    return payload;
  } else if (config.schemaVersion === 3) {
    const _logs = logs;
    return Object.assign(payload, {
      'log2amqp-schema-version': '3.0.0',
      logs: _logs
    });
  }
  throw new Error(`Unsupported schema version ${config.schemaVersion}`);
};
