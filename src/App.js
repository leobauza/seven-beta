import React, { Component, Fragment } from 'react'

// ethereum specific
import SimpleStorageContract from './contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import contract from 'truffle-contract'

class App extends Component {
  constructor(props) {
    super(props)

    this.simpleStorage = null
    this.web3 = null

    this.state = {
      storedValue: 0,
      localValue: 0,
      isStoredValueUpdated: true,
      txHash: null
    }
  }

  componentWillMount() {
    getWeb3
      .then(results => {
        this.web3 = results.web3

        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3')
      })
  }

  instantiateContract() {
    this.simpleStorage = contract(SimpleStorageContract)
    this.simpleStorage.setProvider(this.web3.currentProvider)

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

  setStoredValue(val) {
    this.setState({ storedValue: val })
  }

  setLocalValue = e => {
    this.setState({ localValue: e.target.value })
  }

  saveValueToBlockchain = e => {
    e.preventDefault()

    const { localValue, storedValue, isStoredValueUpdated } = this.state
    let simpleStorageInstance = null

    if (localValue === storedValue || !isStoredValueUpdated) {
      return
    }

    this.web3.eth.getAccounts((error, accounts) => {
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
            isStoredValueUpdated: true
          })
        })
    })

  }

  render() {
    const { storedValue, localValue, isStoredValueUpdated } = this.state
    return (
      <Fragment>
        <header className="container">
          <h1>Store A Value</h1>
        </header>
        <section className="container">
          {!isStoredValueUpdated && (
            <p>Updating...</p>
          )}
          <p>
            The stored value is: <strong>{storedValue}</strong>
          </p>
          <form onSubmit={this.saveValueToBlockchain}>
            <label htmlFor="stored-value">Change Stored Value</label>
            <input
              id="stored-value"
              type="number"
              onChange={this.setLocalValue}
              value={localValue}
            />
            <button className="btn" type="submit">Store Value</button>
          </form>
        </section>
      </Fragment>
    )
  }
}

export default App
