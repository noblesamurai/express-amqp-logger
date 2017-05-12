const chai = require('chai');
const dirtyChai = require('dirty-chai');
const expect = chai.expect;

chai.use(dirtyChai);

describe('amqp-logger', function () {
  it('should handle bad config', function () {
    const logger = require('..')({});
    expect(logger().log).to.be.a('function');
    expect(logger().flush).to.be.a('function');
    return logger().flush();
  });
});
