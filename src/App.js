import React, { Component, Fragment } from 'react'

// ethereum specific
import SimpleStorageContract from 'contracts/SimpleStorage.json'
import TestZepContract from 'contracts/TestZep.json'
import getWeb3 from './utils/getWeb3'
import contract from 'truffle-contract'

// @TODO
// - [ ] Detect changing accounts via MetaMask?
// - [ ] How to develop with websockets...I think this requires switching to using
// geth or parity or both or maybe ganache-cli? No idea at the moment (backburner)
// - [ ] Split into multiple components
// - [ ] Split into multiple routes

class App extends Component {
  constructor(props) {
    super(props)

    this.simpleStorage = null
    this.testZep = null
    this.web3 = null
    this.accounts = null

    this.state = {
      isStoredValueUpdated: true,
      localValue: 0,
      storedValue: 0,
      testZepBalance: 0,
      txHash: null,
      canClaimTestZep: false
    }
  }

  componentWillMount() {
    getWeb3
      .then(results => {
        this.web3 = results.web3

        this.web3.eth.net
          .getNetworkType()
          .then(network => {
            console.log('network:', network)
          })
        this.instantiateContracts()
      })
      .catch(() => {
        console.log('Error finding web3')
      })
  }

  instantiateContracts() {

    const { eth, utils, currentProvider } = this.web3

    eth.getAccounts((error, accounts) => {
      console.log('Active Accounts:', accounts)
      this.accounts = accounts

      accounts.forEach(account => {
        eth.getBalance(account, (err, balance) => {
          if (!err) {
            console.log(account, utils.fromWei(balance, 'ether'))
          }
        })
      })

    })

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


    this.testZep = contract(TestZepContract)
    this.testZep.setProvider(currentProvider)

    this.testZep
      .deployed()
      .then(instance => {
        console.log('TestZepContract Address:', instance.address)
        instance.released('0x824dc428405f9914c38f82d695cb1fdca2e9f69d').then(tr => console.log('Released', tr.c[0]))
        instance.getPayees().then(p => {
          console.log('Payees:', p)
          this.setState({
            // FOR F'S SAKE https://www.quora.com/Is-an-Ethereum-Wallet-address-case-sensitive
            // WHY DO ADDRESSES COME WITH CAPITAL LETTERS SOMETIMES?@!
            canClaimTestZep: p.indexOf(this.accounts[0].toLowerCase()) >= 0
          })
        })
        instance.getShares().then(s => console.log('Shares:', s.c[0]))
        eth.getBalance(instance.address, (err, balance) => {
          if (!err) {
            this.setState({
              testZepBalance: utils.fromWei(balance, 'ether')
            })
          } else {
            console.error(err)
          }
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

    this.simpleStorage
      .deployed()
      .then(instance => {
        simpleStorageInstance = instance
        this.setState({ isStoredValueUpdated: false })
        return simpleStorageInstance.set(localValue, { from: this.accounts[0] })
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

  sendEtherToTestZep = e => {
    const { eth, utils } = this.web3

    this.testZep
      .deployed()
      .then(instance => {
        const transactionObject = {
          from: this.accounts[0],
          to: instance.address,
          value: utils.toWei('.5', 'ether')
        }

        eth.sendTransaction(transactionObject, (err, txHash) => {
          if (!err) {
            console.log('sendTransaction txHash', txHash)
          }
        })
      })
  }

  updateTestZepBalance = e => {
    const { eth, utils } = this.web3

    this.testZep
      .deployed()
      .then(instance => {
        eth.getBalance(instance.address, (err, balance) => {
          if (!err) {
            this.setState({
              testZepBalance: utils.fromWei(balance, 'ether')
            })
          } else {
            console.error(err)
          }
        })
      })
  }

  claimEtherFromTestZep = e => {
    const { canClaimTestZep } = this.state

    if (!canClaimTestZep) {
      return
    }
    // if this address is a payee then call claim...
    // @TODO
    // - [ ] Add check to see if there is anything for them to claim (perhaps
    // tied to calculating gas cost?)
    this.testZep
      .deployed()
      .then(instance => {
        return instance.claim({ from: this.accounts[0] })
      })
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.log('Claim was unssucesful I guess?', err)
      })
  }

  render() {
    const { storedValue, localValue, isStoredValueUpdated, testZepBalance, canClaimTestZep } = this.state
    return (
      <Fragment>
        <header className="container">
          <h1>Store A Value</h1>
        </header>
        <section className="container">
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

          <h2 className="heading">TestZep Contract</h2>
          <p>This is a test of the SplitPayment Open Zeppelin Contract. Accounts 1 and 2 Should be able to Claim their share of Ether. Any other account only send ether to the contract.</p>
          <p>TestZep Latest Balance: {testZepBalance}</p>
          <div className="btn-group">
            <button onClick={this.updateTestZepBalance} className="btn" type="button">Update TestZep Balance (testZepBalance)</button>
            <button onClick={this.sendEtherToTestZep} className="btn" type="button">Send .05 ETH to TestZepContract</button>
            {canClaimTestZep && (
              <button onClick={this.claimEtherFromTestZep} className="btn" type="button">Claim Your Share of Ether</button>
            )}
          </div>
        </section>
      </Fragment>
    )
  }
}

export default App
