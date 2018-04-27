const chai = require('chai');
const dirtyChai = require('dirty-chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

chai.use(dirtyChai);

describe('amqp-logger', function () {
  describe('unhappy cases', function () {
    it('should handle bad config', function () {
      const logger = require('..')({});
      expect(logger().log).to.be.a('function');
      expect(logger().flush).to.be.a('function');
      return logger().flush();
    });
    it('should throw an error if you try to flush a logger more than once', function () {
      const logger = require('..')({})();
      return logger.flush().then(function () {
        expect(logger.flush).to.throw(Error);
      });
    });
  });
  describe('happy cases', function () {
    let publishStub;
    let logger;
    let obj;
    let arr;
    beforeEach(function () {
      publishStub = sinon.stub().resolves();
      logger = proxyquire('..', {
        'amqp-wrapper': function () {
          return {
            connect: sinon.stub().resolves(),
            publish: publishStub
          };
        }
      })({
        routingKey: 'mine',
        source: 'my-source'
      })();
      obj = {thing: 'that'};
      arr = [1, 2, 3];
      logger.log('moo', obj);
      logger.log('fips', obj);
      logger.log('crig', arr);
    });

    it('should publish the concatenated payloads', function () {
      return logger.flush().then(function () {
        expect(publishStub.callCount).to.equal(1);
        expect(publishStub.lastCall.args[0]).to.equal('mine');
        expect(publishStub.lastCall.args[1].logs).to.be.ok();
        expect(publishStub.lastCall.args[1].logs.length).to.equal(3);
        expect(publishStub.lastCall.args[1].logs[0].moo).to.equal(obj);
        expect(publishStub.lastCall.args[1].logs[1].fips).to.equal(obj);
        expect(publishStub.lastCall.args[1].logs[2].crig).to.equal(arr);
      });
    });

    it('should publish a uuid to identify the message', function () {
      return logger.flush().then(function () {
        expect(publishStub.callCount).to.equal(1);
        expect(publishStub.lastCall.args[0]).to.equal('mine');
        expect(publishStub.lastCall.args[1].id).to.be.ok();
        expect(publishStub.lastCall.args[1].id).to.be.a('string');
      });
    });

    it('should include a timestamp in the message', function () {
      return logger.flush().then(function () {
        expect(publishStub.callCount).to.equal(1);
        expect(publishStub.lastCall.args[0]).to.equal('mine');
        expect(publishStub.lastCall.args[1].timestamp).to.be.ok();
        expect(publishStub.lastCall.args[1].timestamp).to.be.a('number');
      });
    });

    it('should include the source in the message', function () {
      return logger.flush().then(function () {
        expect(publishStub.callCount).to.equal(1);
        expect(publishStub.lastCall.args[1].source).equal('my-source');
      });
    });
  });
});
