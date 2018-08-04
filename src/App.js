import React, { Component, Fragment } from 'react'
// Web3
import getWeb3 from './utils/getWeb3'
// components
import StoreValue from './components/StoreValue'
import TestZep from './components/TestZep'
import Home from './components/Home'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

// @TODO
// - [ ] Detect changing accounts via MetaMask?
// - [ ] How to develop with websockets...I think this requires switching to using
// geth or parity or both or maybe ganache-cli? No idea at the moment (backburner)
// - [x] Split into multiple components
// - [x] Split into multiple routes
// - [x] Do a random JSONRPC test to understand what's going on...
// - [ ] Consider using this.web3.eth.Contract instead of truffle contract for Web3 1.x.x
// see: https://ethereum.stackexchange.com/questions/47206/difference-between-truffle-contract-and-web3-eth-contract
// also see: https://github.com/upperwal/react-box/blob/master/src/App.js

class App extends Component {
  constructor(props) {
    super(props)

    this.web3 = null

    this.state = {
      accounts: null,
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

    const { eth, utils } = this.web3

    eth.getAccounts((error, accounts) => {
      console.log('Active Accounts:', accounts)

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
  }

  render() {
    const { accounts } = this.state
    return (
      <Router>
        <Fragment>
          <header className="container">
            <h1 className="heading">My dApps</h1>

            <nav className="site-nav">
              {accounts ? (
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/test-zep">Deposit/Claim</Link></li>
                  <li><Link to="/store-value">Store Value</Link></li>
                </ul>
              ) : (<p>Accounts are Loading!</p>)}
            </nav>
          </header>
          <section className="container">

            {/* Wait until accounts are available... */}
            {accounts ? (
              <Fragment>
                <Route exact path="/" component={Home}/>
                <Route
                  path='/store-value'
                  render={(props) => <StoreValue {...props} accounts={accounts} web3={this.web3} />}
                />
                <Route
                  path='/test-zep'
                  render={(props) => <TestZep {...props} accounts={accounts} web3={this.web3} />}
                />
              </Fragment>
            ) : (<p>Accounts Are Loading!</p>)}
          </section>
        </Fragment>
      </Router>
    )
  }
}

export default App
