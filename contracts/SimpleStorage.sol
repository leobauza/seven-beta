pragma solidity ^0.4.18;

contract SimpleStorage {
  uint storedData;

  function set(uint x) public {
    storedData = x;
  }

  /**
   * => view (modifier): for functions: Disallows modification of state [other
   * modifiers include: pure, payable, constant, etc]
   * => public (visibility): visible externally and internally
   * => uint (type): unsigned integer
   */
  function get() public view returns (uint) {
    return storedData;
  }
}
