const uuid = require('uuid/v1');

function common (config) {
  return {
    id: uuid(),
    timestamp: Date.now(),
    source: config.source
  };
}

module.exports = function formatPayload (config, logs) {
  if (config.schemaVersion === 2) {
    return Object.assign(common(config), {
      'log2amqp-schema-version': '2.1.0',
      logs: logs.map(l => {
        const ret = {};
        ret[l.type] = l.data;
        return ret;
      })
    });
  } else if (config.schemaVersion === 3) {
    return Object.assign(common(config), {
      'log2amqp-schema-version': '3.0.0',
      logs
    });
  }
  throw new Error(`Unsupported schema version ${config.schemaVersion}`);
};
