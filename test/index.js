const chai = require('chai');
const dirtyChai = require('dirty-chai');
const expect = chai.expect;

chai.use(dirtyChai);

describe('my thing', function () {
  it('should work', function () {
    expect(true).to.be.true;
    throw new Error('unimplemented');
  });
});
