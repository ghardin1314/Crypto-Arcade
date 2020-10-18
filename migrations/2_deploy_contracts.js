var AstroidsContract = artifacts.require("./AstroidsContract.sol");

module.exports = function(deployer) {
  deployer.deploy(AstroidsContract);
};
