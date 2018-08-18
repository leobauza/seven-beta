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
    this.instantiateContract()
  }

  async instantiateContract() {
    const { eth } = this.props.web3

    // @TODO
    // - [x] this breaks without MetaMask provider...definitely use
    // web3.eth.Contract instead (I think it will fix stuff)
    // see: https://github.com/trufflesuite/truffle-contract/issues/57
    // - [x] Test that this function returns an instance of SimpleStorageContract
    // (ie. methods.get and methods.set exist??)
    // - [ ] User real code to get network and contract address (config file?)
    const simpleStorage = new eth.Contract(
      SimpleStorageContract.abi,
      SimpleStorageContract.networks[5777].address
    )

    const result = await simpleStorage.methods.get().call()

    this.setState({
      instance: simpleStorage,
      localValue: result,
      storedValue: result
    })

    return simpleStorage
  }

  handleLocalValueChange = e => {
    this.setState({ localValue: e.target.value })
  }

  saveValueToBlockchain = async e => {
    e.preventDefault()

    const {
      localValue,
      storedValue,
      isStoredValueUpdated,
      instance
    } = this.state

    if (localValue === storedValue || !isStoredValueUpdated) {
      return
    }

    this.updateUiBeforeTransaction()
    const tx = await this.sendTxWithGas()

    if (tx && tx.transactionHash) {
      const result = await instance.methods.get().call()
      this.updateUiAfterTransaction(result, tx)
    }
  }

  sendTxWithGas(method = 'set') {
    const { accounts } = this.props
    const { localValue, instance } = this.state

    return accounts[0]
      ? instance.methods[method](localValue).send({ from: accounts[0] })
      : null
  }

  updateUiBeforeTransaction() {
    const { setNotice } = this.props

    this.setState({ isStoredValueUpdated: false })
    setNotice(<p>Storing value on the blockchain</p>)
  }

  updateUiAfterTransaction(result, tx) {
    const { setNotice } = this.props

    setNotice(
      <p>
        Value {result} has been stored! tx: {tx.transactionHash}
      </p>
    )
    this.setState({
      storedValue: result,
      isStoredValueUpdated: true
    })
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
              onChange={this.handleLocalValueChange}
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
