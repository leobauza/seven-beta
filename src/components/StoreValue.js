import React, { Component, Fragment } from 'react'
import SimpleStorageContract from 'contracts/SimpleStorage.json'
import contract from 'truffle-contract'

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
    const { currentProvider } = this.props.web3

    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(currentProvider)
    const instance = await simpleStorage.deployed()
    const result = await instance.get.call()

    this.setState({
      storedValue: result.c[0],
      localValue: result.c[0]
    })

    return instance
  }

  setLocalValue = e => {
    this.setState({ localValue: e.target.value })
  }

  setStoredValue(val) {
    this.setState({ storedValue: val })
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
    const tx = await instance.set(localValue, { from: accounts[0] })

    if (tx.receipt) {
      const result = await instance.get.call()
      setNotice(<p>Value {localValue} has been stored!</p>)
      this.setState({
        storedValue: result.c[0],
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
