import React, { Component, Fragment } from 'react'
import SimpleStorageContract from 'contracts/SimpleStorage.json'
import contract from 'truffle-contract'

export default class StoreValue extends Component {
  constructor(props) {
    super(props)

    this.simpleStorage = null

    this.state = {
      isStoredValueUpdated: true,
      localValue: 0,
      storedValue: 0,
    }
  }

  componentWillMount() {
    this.instantiateContract()
  }

  instantiateContract() {

    const { currentProvider } = this.props.web3

    this.simpleStorage = contract(SimpleStorageContract)
    this.simpleStorage.setProvider(currentProvider)

    this.simpleStorage
      .deployed()
      .then(instance => {
        return instance.get.call()
      })
      .then(result => {
        return this.setState({
          storedValue: result.c[0],
          localValue: result.c[0],
        })
      })
  }

  setLocalValue = e => {
    this.setState({ localValue: e.target.value })
  }

  setStoredValue(val) {
    this.setState({ storedValue: val })
  }

  saveValueToBlockchain = e => {
    e.preventDefault()

    const { accounts } = this.props
    const { localValue, storedValue, isStoredValueUpdated } = this.state
    let simpleStorageInstance = null

    if (localValue === storedValue || !isStoredValueUpdated) {
      return
    }

    this.simpleStorage
      .deployed()
      .then(instance => {
        simpleStorageInstance = instance
        this.setState({ isStoredValueUpdated: false })
        return simpleStorageInstance.set(localValue, { from: accounts[0] })
      })
      .then(result => {
        return simpleStorageInstance.get.call()
      })
      .then(result => {
        return this.setState({
          storedValue: result.c[0],
          isStoredValueUpdated: true,
        })
      })
  }

  render() {
    const { storedValue, localValue, isStoredValueUpdated } = this.state

    return(
      <Fragment>
        <h2 className="heading">Store A Value</h2>
        {!isStoredValueUpdated && <p>Updating...</p>}
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
          <button className="btn" type="submit">
            Store Value
          </button>
        </form>
      </Fragment>
    )
  }
}
