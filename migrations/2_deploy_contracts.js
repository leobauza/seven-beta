const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const TestZep = artifacts.require("./TestZep.sol");

module.exports = function(deployer, network, accounts) {
  const payees = [
    accounts[1],
    accounts[2]
  ]

  const shares = [
    50,
    100
  ]

  return deployer
    .then(() => {
      return deployer.deploy(SimpleStorage)
    })
    .then(() => {
      return deployer.deploy(
        TestZep,
        payees,
        shares
      )
    })
}
