import React, { Component, Fragment } from 'react'
import TestZepContract from 'contracts/TestZep.json'
import contract from 'truffle-contract'

export default class TestZep extends Component {
  state = {
    balance: 0,
    canClaim: false,
    instance: null,
    payeeData: []
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

    // Create instance
    const testZep = contract(TestZepContract)
    testZep.setProvider(currentProvider)
    const instance = await testZep.deployed()

    // Used for calculating payments and if account can claim payment
    const payees = await instance.getPayees()
    const shares = await instance.getShares()
    const released0 = await instance.released(payees[0])
    const released1 = await instance.released(payees[1])
    const shares0 = await instance.shares(payees[0])
    const shares1 = await instance.shares(payees[1])

    console.log('Total Shares:', shares.c[0])
    console.log(`Released for ${payees[0]}`, released0.c[0])
    console.log(`Released for ${payees[1]}`, released1.c[0])
    console.log(`Shares for ${payees[0]}`, shares0.c[0])
    console.log(`Shares for ${payees[1]}`, shares1.c[0])
    console.log('TestZepContract Address:', instance.address)

    eth.getBalance(instance.address, (err, balance) => {
      if (!err) {
        const totalReceived = balance

        // @TODO this is the formula on the contract to determine payments:
        // totalReceived.mul(shares[payee]).div(totalShares).sub(released[payee]);
        // - [ ] Display these values
        // - [ ] Determine whether current account can claim
        // - [ ] Prevent errors in claiming before claiming...
        const payee0Data = {
          canClaimAmount: utils.fromWei(
            `${(totalReceived * shares0.c[0]) / shares - released0.c[0]}`,
            'ether'
          )
        }

        // Payee 0
        console.log(
          `next payment for ${payees[0]}`,
          utils.fromWei(
            `${(totalReceived * shares0.c[0]) / shares - released0.c[0]}`,
            'ether'
          )
        )

        // Payee 1
        console.log(
          `next payment for ${payees[1]}`,
          utils.fromWei(
            `${(totalReceived * shares1.c[0]) / shares - released1.c[0]}`,
            'ether'
          )
        )

        this.setState({
          balance: utils.fromWei(balance, 'ether')
        })
      } else {
        console.error(err)
      }
    })

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

    eth
      .sendTransaction(transactionObject)
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
    } catch (err) {
      console.error('Claim was unssucesful I guess?', err)
    }
  }

  render() {
    const { balance, canClaim, instance } = this.state
    const numberBalance = Number.parseFloat(balance) // so we can use `toFixed`

    if (instance) {
      return (
        <Fragment>
          <h2 className="heading">TestZep Contract</h2>
          <p>
            This is a test of the SplitPayment Open Zeppelin Contract. Accounts
            1 and 2 Should be able to Claim their share of Ether. Any other
            account only send ether to the contract.
          </p>
          <p>
            TestZep Latest Balance: <code>{balance} Ξ</code>
          </p>
          <div className="btn-group">
            <button
              onClick={this.updateTestZepBalance}
              className="btn"
              type="button"
            >
              Update TestZep Balance (<code>{numberBalance.toFixed(2)} Ξ</code>)
            </button>
            <button
              onClick={this.sendEtherToTestZep}
              className="btn"
              type="button"
            >
              Send <code>0.05 Ξ</code> to TestZepContract
            </button>
            {canClaim && (
              <button
                onClick={this.claimEtherFromTestZep}
                className="btn"
                type="button"
              >
                Claim Your Share of Ether
              </button>
            )}
          </div>
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
