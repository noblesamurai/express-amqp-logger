const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

const AMQPLogger = require('..');

describe('amqp-logger', function () {
  describe('unhappy cases', function () {
    it('requires schemaVersion', function () {
      expect(() => new AMQPLogger({})).to.throw();
    });
    it('throws on unsupported schema version', function () {
      expect(() => new AMQPLogger({ schemaVersion: -1 })).to.throw();
    });
    it('should handle bad AMQP config', function () {
      const logger = new AMQPLogger({ source: 'misha', schemaVersion: 2 });
      expect(logger.log).to.be.a('function');
      expect(logger.flush).to.be.a('function');
      return logger.flush();
    });
    it('should reject if you try to flush a logger more than once', async function () {
      const logger = new AMQPLogger({ source: 'tom', amqp: {}, schemaVersion: 2 });
      await logger.flush();
      expect(logger.flush()).to.be.rejected();
    });
  });
  describe('happy cases', function () {
    let publishStub;
    let logger;
    let obj;
    let arr;
    beforeEach(function () {
      publishStub = sinon.stub().resolves();
      const AMQPLogger = proxyquire('..', {
        'amqp-wrapper': function () {
          return {
            connect: sinon.stub().resolves(),
            publish: publishStub
          };
        }
      });
      const config = {
        amqp: { routingKey: 'mine' },
        source: 'my-source',
        schemaVersion: 2
      };
      logger = new AMQPLogger(config);
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

    it('should include an indexable key in the message', async function () {
      await logger.flush({ meta: { blerg: 'thing' } });
      expect(publishStub.callCount).to.equal(1);
      expect(publishStub.lastCall.args[1].meta).to.be.an('object');
      expect(publishStub.lastCall.args[1].meta).to.include.key('blerg');
      expect(publishStub.lastCall.args[1].meta.blerg).to.equal('thing');
    });

    it('support payload version 3', async function () {
      const AMQPLogger = proxyquire('..', {
        'amqp-wrapper': function () {
          return {
            connect: sinon.stub().resolves(),
            publish: publishStub
          };
        }
      });
      const config = {
        amqp: { routingKey: 'mine' },
        source: 'my-source',
        schemaVersion: 3
      };
      const logger = new AMQPLogger(config);
      const payload = { thing: 'with' };
      logger.log('merf', payload);
      await logger.flush();
      expect(publishStub.callCount).to.equal(1);
      const logged = publishStub.lastCall.args[1];
      expect(logged.logs).to.be.ok();
      expect(logged.logs).to.have.length(1);
      expect(logged.logs[0].type).to.equal('merf');
      expect(logged.logs[0].data).to.equal(payload);
    });
  });
});
