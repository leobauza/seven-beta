import React, { Component, Fragment } from 'react'
import { Ie } from './utils/converters'
import { ETH } from './utils/constants'
// Web3
import getWeb3 from './utils/getWeb3'
// components
import SevenTokens from './components/SevenTokens'
import StoreValue from './components/StoreValue'
import TestZep from './components/TestZep'
import Home from './components/Home'
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom'

// @TODO
// - [x] Detect changing accounts via MetaMask?
// - [ ] How to develop with websockets...I think this requires switching to using
// geth or parity or both or maybe ganache-cli? No idea at the moment (backburner)
// - [x] Split into multiple components
// - [x] Split into multiple routes
// - [x] Do a random JSONRPC test to understand what's going on...
// - [x] Consider using this.web3.eth.Contract instead of truffle contract for Web3 1.x.x
// see: https://ethereum.stackexchange.com/questions/47206/difference-between-truffle-contract-and-web3-eth-contract
// also see: https://github.com/upperwal/react-box/blob/master/src/App.js
// - [ ] Add SevenTokens functionality
// - [ ] Write a contract only accepts an exact payment (https://ethereum.stackexchange.com/questions/30145/how-to-write-a-contract-that-can-only-accept-a-payment-of-fixed-amount)
// - [ ] Find a way to transalte ETH to USD or native currency...
// - [ ] Write contract tests
// - [ ] Write components tests

class App extends Component {
  constructor(props) {
    super(props)

    this.web3 = null

    this.state = {
      accounts: null,
      balance: 0,
      network: null,
      notice: null
    }
  }

  componentDidMount() {
    getWeb3
      .then(results => {
        this.web3 = results.web3

        this.web3.eth.net.getNetworkType().then(network => {
          this.setState({ network })
        })

        this.instantiateAccounts()
      })
      .catch(() => {
        console.error('Error finding web3') // eslint-disable-line
      })
  }

  componentWillUnmount() {
    if (!this.web3) {
      return
    }

    const { currentProvider } = this.web3
    // Remove listeners to prevent memory leaks during HMRing
    if (currentProvider.publicConfigStore) {
      currentProvider.publicConfigStore.removeAllListeners()
    }
  }

  instantiateAccounts() {
    const { eth, currentProvider } = this.web3

    if (currentProvider.publicConfigStore) {
      // Triggers when switching accounts with MetaMask
      currentProvider.publicConfigStore.on('update', this.updateAccount)
    }

    // @TODO this is only getting one account...why not all the accounts I have?
    // (probably something to do with the way metamask provide-engine handles
    // this stuff
    eth.getAccounts((error, accounts) => {
      // FOR F'S SAKE https://www.quora.com/Is-an-Ethereum-Wallet-address-case-sensitive
      // WHY DO ADDRESSES COME WITH CAPITAL LETTERS SOMETIMES?@!
      accounts = accounts.map(a => a.toLowerCase())

      accounts.forEach(account => {
        eth.getBalance(account, (err, balance) => {
          balance = Ie(balance)
          if (!err) {
            this.setState({
              accounts,
              balance
            })
          }
        })
      })
    })
  }

  updateAccount = ({ selectedAddress }) => {
    const { eth } = this.web3
    const { accounts } = this.state
    const newAccount = [selectedAddress.toLowerCase()].concat(accounts.slice(1))

    if (selectedAddress !== accounts[0]) {
      console.log('change accounts!') // eslint-disable-line
      console.log('from:', accounts[0]) // eslint-disable-line
      console.log('to:', selectedAddress) // eslint-disable-line

      newAccount.forEach(account => {
        eth.getBalance(account, (err, balance) => {
          balance = Ie(balance)
          if (!err) {
            this.setState({
              accounts: newAccount,
              balance
            })
          }
        })
      })
    }
  }

  setNotice = notice => {
    this.setState({
      notice
    })
  }

  render() {
    const { accounts, balance, network, notice } = this.state
    return (
      <Router>
        <Fragment>
          <aside
            aria-hidden={notice ? undefined : 'true'}
            aria-live="polite"
            className="notice"
          >
            {notice}
            <button onClick={() => this.setNotice(null)} type="button">
              <i>Close</i>
            </button>
          </aside>
          <header className="container">
            <h1 className="heading">
              My dApps <code className="small">{accounts && accounts[0]}</code>
            </h1>
            <p>
              <strong>Network: </strong>
              <code className="small">{network}</code>{' '}
              <strong>Balance: </strong>
              <code className="small">
                {balance} {ETH}
              </code>
            </p>
            <nav className="site-nav">
              {accounts ? (
                <ul>
                  <li>
                    <NavLink exact activeClassName="-active" to="/">
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink activeClassName="-active" to="/store-value">
                      Store Value
                    </NavLink>
                  </li>
                  <li>
                    <NavLink activeClassName="-active" to="/test-zep">
                      Deposit/Claim
                    </NavLink>
                  </li>
                  <li>
                    <NavLink activeClassName="-active" to="/seven-tokens">
                      Seven ERC-721 Tokens
                    </NavLink>
                  </li>
                </ul>
              ) : (
                <p>Accounts are Loading!</p>
              )}
            </nav>
          </header>
          <section className="container">
            {/* Wait until accounts are available... */}
            {accounts ? (
              <Fragment>
                <Route exact path="/" component={Home} />
                <Route
                  path="/store-value"
                  render={props => (
                    <StoreValue
                      {...props}
                      accounts={accounts}
                      web3={this.web3}
                      setNotice={this.setNotice}
                    />
                  )}
                />
                <Route
                  path="/test-zep"
                  render={props => (
                    <TestZep {...props} accounts={accounts} web3={this.web3} />
                  )}
                />
                <Route
                  path="/seven-tokens"
                  render={props => (
                    <SevenTokens
                      {...props}
                      accounts={accounts}
                      web3={this.web3}
                    />
                  )}
                />
              </Fragment>
            ) : (
              <p>Accounts Are Loading!</p>
            )}
          </section>
        </Fragment>
      </Router>
    )
  }
}

export default App
