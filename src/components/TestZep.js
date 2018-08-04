import React, { Component, Fragment } from 'react'
import TestZepContract from 'contracts/TestZep.json'
import contract from 'truffle-contract'

export default class TestZep extends Component {
  constructor(props) {
    super(props)

    this.TestZep = null

    this.state = {
      testZepBalance: 0,
      txHash: null,
      canClaimTestZep: false
    }
  }

  componentWillMount() {
    this.instantiateContract()
  }

  instantiateContract() {
    const { accounts, web3 } = this.props
    const { eth, utils, currentProvider } = web3

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
            canClaimTestZep: p.indexOf(accounts[0].toLowerCase()) >= 0
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
    const { accounts, web3 } = this.props
    const { eth, utils } = web3

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
    const { eth, utils } = this.props.web3

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
    const { accounts } = this.props

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
    const { testZepBalance, canClaimTestZep } = this.state

    return(
      <Fragment>
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
      </Fragment>
    )
  }
}
