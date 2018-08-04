import React, { Component, Fragment } from 'react'
import TestZepContract from 'contracts/TestZep.json'
import contract from 'truffle-contract'

export default class TestZep extends Component {
  state = {
    balance: 0,
    canClaim: false,
    instance: null
  }

  componentDidMount() {
    this.instantiateContract().then(instance => {
      this.setState({
        instance
      })
    })
  }

  async componentDidUpdate(prevProps) {
    const { accounts } = this.props
    const { instance } = this.state

    if (!instance || accounts === prevProps.accounts) {
      return
    }

    const payees = await instance.getPayees()
    this.setState({
      canClaim: payees.indexOf(accounts[0]) >= 0
    })
  }

  async instantiateContract() {
    const { accounts, web3 } = this.props
    const { eth, utils, currentProvider } = web3

    const testZep = contract(TestZepContract)
    testZep.setProvider(currentProvider)

    const instance = await testZep.deployed()
    const payees = await instance.getPayees()

    console.log('TestZepContract Address:', instance.address)
    instance.released('0x824dc428405f9914c38f82d695cb1fdca2e9f69d').then(tr => console.log('Released', tr.c[0]))
    instance.getShares().then(s => console.log('Shares:', s.c[0]))

    eth.getBalance(instance.address, (err, balance) => {
      if (!err) {
        this.setState({
          balance: utils.fromWei(balance, 'ether')
        })
      } else {
        console.error(err)
      }
    })

    console.log('Payees:', payees)
    this.setState({
      canClaim: payees.indexOf(accounts[0]) >= 0
    })
    return instance
  }

  sendEtherToTestZep = e => {
    const { instance } = this.state
    const { accounts, web3 } = this.props
    const { eth, utils } = web3

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
            balance: utils.fromWei(balance, 'ether')
          })
        } else {
          console.error(err)
        }
      })
    })
    .on('error', err => {
      console.error('Tx Error', err)
    })
  }

  updateTestZepBalance = e => {
    const { eth, utils } = this.props.web3
    const { instance } = this.state

    eth.getBalance(instance.address, (err, balance) => {
      if (!err) {
        this.setState({
          balance: utils.fromWei(balance, 'ether')
        })
      } else {
        console.error(err)
      }
    })
  }

  claimEtherFromTestZep = async e => {
    // @TODO
    // - [ ] Add check to see if there is anything for them to claim (perhaps
    // tied to calculating gas cost?)

    if (!this.state.canClaim) {
      return
    }

    const { accounts } = this.props
    const { instance } = this.state

    try {
      // if this address is a payee then call claim...
      const claim = await instance.claim({ from: accounts[0] })
      console.log(claim)
    } catch(err) {
      console.error('Claim was unssucesful I guess?', err)
    }
  }

  render() {
    const { balance, canClaim, instance } = this.state

    if (instance) {
      return(
        <Fragment>
          <h2 className="heading">TestZep Contract</h2>
          <p>This is a test of the SplitPayment Open Zeppelin Contract. Accounts 1 and 2 Should be able to Claim their share of Ether. Any other account only send ether to the contract.</p>
          <p>TestZep Latest Balance: {balance}</p>
          <div className="btn-group">
            <button onClick={this.updateTestZepBalance} className="btn" type="button">Update TestZep Balance ({balance})</button>
            <button onClick={this.sendEtherToTestZep} className="btn" type="button">Send .05 ETH to TestZepContract</button>
            {canClaim && (
              <button onClick={this.claimEtherFromTestZep} className="btn" type="button">Claim Your Share of Ether</button>
            )}
          </div>
        </Fragment>
      )
    } else {
      return(
        <div>
          <h2>Loading UI...</h2>
        </div>
      )
    }
  }
}
