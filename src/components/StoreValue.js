import React, { Component, Fragment } from 'react'
import SimpleStorageContract from 'contracts/SimpleStorage.json'

export default class StoreValue extends Component {
  state = {
    instance: null,
    isStoredValueUpdated: true,
    localValue: 0,
    storedValue: 0
  }

  componentDidMount() {
    this.instantiateContract().then(instance => {
      this.setState({
        instance
      })
    })
  }

  async instantiateContract() {
    const { eth } = this.props.web3

    // @TODO
    // - [x] this breaks without MetaMask provider...definitely use
    // web3.eth.Contract instead (I think it will fix stuff)
    // see: https://github.com/trufflesuite/truffle-contract/issues/57
    // - [ ] User real code to get network and contract address
    const simpleStorage = new eth.Contract(
      SimpleStorageContract.abi,
      SimpleStorageContract.networks[5777].address
    )

    // simpleStorage.setProvider(currentProvider)
    // const instance = await simpleStorage.deployed()
    const result = await simpleStorage.methods.get().call()

    this.setState({
      storedValue: result,
      localValue: result
    })

    return simpleStorage
  }

  setLocalValue = e => {
    this.setState({ localValue: e.target.value })
  }

  saveValueToBlockchain = async e => {
    e.preventDefault()

    const { accounts, setNotice } = this.props
    const {
      localValue,
      storedValue,
      isStoredValueUpdated,
      instance
    } = this.state

    if (localValue === storedValue || !isStoredValueUpdated) {
      return
    }

    this.setState({ isStoredValueUpdated: false })
    setNotice(<p>Storing value on the blockchain</p>)
    const tx = await instance.methods
      .set(localValue)
      .send({ from: accounts[0] })

    if (tx.transactionHash) {
      const result = await instance.methods.get().call()

      setNotice(
        <p>
          Value {localValue} has been stored! tx: {tx.transactionHash}
        </p>
      )
      this.setState({
        storedValue: result,
        isStoredValueUpdated: true
      })
    }
  }

  render() {
    const {
      storedValue,
      localValue,
      isStoredValueUpdated,
      instance
    } = this.state

    if (instance) {
      return (
        <Fragment>
          <h2 className="heading">Store A Value</h2>
          <p>
            Stored value is: <strong>{storedValue}</strong>
          </p>
          <form onSubmit={this.saveValueToBlockchain}>
            <label htmlFor="stored-value">Change Stored Value</label>
            <input
              id="stored-value"
              type="number"
              onChange={this.setLocalValue}
              value={localValue}
            />
            {isStoredValueUpdated && (
              <button className="btn" type="submit">
                Store Value
              </button>
            )}
          </form>
        </Fragment>
      )
    } else {
      return (
        <div>
          <h2>Loading UI...</h2>
        </div>
      )
    }
  }
}
