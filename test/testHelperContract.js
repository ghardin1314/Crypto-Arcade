const assert = require("assert");

const HelperContract = artifacts.require("HelperContract");

contract("HelperContract", () => {

  let contractInstance;
  beforeEach(async () => {
    contractInstance = await HelperContract.new();
  });

  afterEach(async () => {
    await contractInstance.kill();
 });

  it("should return sum of array of uints", async () => {
    const inputArray = [1, 3, 5, 7, 9];

    const result = await contractInstance.getArraySum(inputArray);
    assert.equal(result, 25);
  });
});
