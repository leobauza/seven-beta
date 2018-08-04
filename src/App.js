import React, { Component, Fragment } from 'react'

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

// ethereum specific
import TestZepContract from 'contracts/TestZep.json'
import getWeb3 from './utils/getWeb3'
import contract from 'truffle-contract'

// components
import StoreValue from './components/StoreValue'

// @TODO
// - [ ] Detect changing accounts via MetaMask?
// - [ ] How to develop with websockets...I think this requires switching to using
// geth or parity or both or maybe ganache-cli? No idea at the moment (backburner)
// - [ ] Split into multiple components
// - [ ] Split into multiple routes
// - [x] Do a random JSONRPC test to understand what's going on...
// - [ ] Consider using this.web3.eth.Contract instead of truffle contract for Web3 1.x.x
// see: https://ethereum.stackexchange.com/questions/47206/difference-between-truffle-contract-and-web3-eth-contract
// also see: https://github.com/upperwal/react-box/blob/master/src/App.js

class App extends Component {
  constructor(props) {
    super(props)

    this.simpleStorage = null
    this.testZep = null
    this.web3 = null

    this.state = {
      accounts: null,
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
        this.instantiateAccounts()
      })
      .catch(() => {
        console.log('Error finding web3')
      })
  }

  instantiateAccounts() {

    const { eth, utils, currentProvider } = this.web3

    let tempAccountPlaceholder = null // erase when moving testZep to its own component

    eth.getAccounts((error, accounts) => {
      console.log('Active Accounts:', accounts)

      tempAccountPlaceholder = accounts

      this.setState({
        accounts
      })

      accounts.forEach(account => {
        eth.getBalance(account, (err, balance) => {
          if (!err) {
            console.log(account, utils.fromWei(balance, 'ether'))
          }
        })
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
            canClaimTestZep: p.indexOf(tempAccountPlaceholder[0].toLowerCase()) >= 0
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

  sendEtherToTestZep = e => {
    const { eth, utils } = this.web3
    const { accounts } = this.state

    this.testZep
      .deployed()
      .then(instance => {
        const transactionObject = {
          from: accounts[0],
          to: instance.address,
          value: utils.toWei('.5', 'ether')
        }

        eth.sendTransaction(transactionObject)
        .on('confirmation', (conf, receipt) => {
          eth.getBalance(instance.address, (err, balance) => {
            if (!err) {
              // Right now this gets set 25 times to the same value...WOMP
              this.setState({
                testZepBalance: utils.fromWei(balance, 'ether')
              })
            } else {
              console.error(err)
            }
          })
        })
        .on('error', err => {
          console.error('Tx Error', err)
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
    const { accounts, canClaimTestZep } = this.state

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
        return instance.claim({ from: accounts[0] })
      })
      .then(result => {
        // @TODO
        // - [ ] Update TestZepBalance here...
        console.log(result)
      })
      .catch(err => {
        console.log('Claim was unssucesful I guess?', err)
      })
  }

  render() {
    const { accounts, testZepBalance, canClaimTestZep } = this.state
    return (
      <Router>
        <Fragment>
          <header className="container">
            <h1>My dApps</h1>

            {accounts ? (
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/store-value">Store Value</Link></li>
              </ul>
            ) : (<p>Accounts are Loading!</p>)}
          </header>
          <section className="container">

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

            {accounts ? (
              <Route
                path='/store-value'
                render={(props) => <StoreValue {...props} accounts={accounts} web3={this.web3} />}
              />
            ) : (<p>Accounts Are Loading!</p>)}
          </section>
        </Fragment>
      </Router>
    )
  }
}

export default App
