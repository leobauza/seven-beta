pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/payment/SplitPayment.sol';

contract TestZep is SplitPayment {
  constructor (address[] _payees, uint256[] _shares)
  public SplitPayment(_payees, _shares) {
    // Additional Constructor Code...
  }

  // I don't know if this is a good thing to do.
  // I could access payees in js but it requires an index
  // not sure why getters for public variables are weird...
  // more on this here: https://ethereum.stackexchange.com/questions/41467/how-do-i-download-an-entire-array-using-web3?rq=1
  function getPayees() public view returns (address[]) {
    return payees;
  }

  function getShares() public view returns (uint256) {
    return totalShares;
  }
}
