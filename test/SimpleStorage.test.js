const SimpleStorage = artifacts.require('SimpleStorage')

contract('SimpleStorage test', async accounts => {
  it('should start out with 0 as the value', async () => {
    let instance = await SimpleStorage.deployed()
    let value = await instance.get.call({ from: accounts[0] })
    assert.equal(value, 0)
  })
})
