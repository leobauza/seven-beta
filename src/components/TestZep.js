import React, { Component, Fragment } from 'react'
import TestZepContract from 'contracts/TestZep.json'
import contract from 'truffle-contract'
import { ETH } from '../utils/constants'
import { Ie } from '../utils/converters'

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

  componentWillUnmount() {
    // @TODO unsubscribe from stuff or whatever
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

    eth.getBalance(instance.address, async (err, balance) => {
      if (!err) {
        // @TODO this is WRONG! it should be total EVER received BALANCE + TOTAL RELEASED
        const totalReleased = await instance.totalReleased()
        const totalReceived = Ie(balance) + Ie(totalReleased)

        // @TODO this is the formula on the contract to determine payments:
        // totalReceived.mul(shares[payee]).div(totalShares).sub(released[payee]);
        // - [x] Display these values
        // - [x] Determine whether current account can claim
        // - [x] Prevent errors in claiming before claiming...
        // - [ ] Should all calculations be done with bigNumbers? Should they be done on the contract?
        // Total Ever Received TIMES Percentage of Shares = Share of Total Ever Received
        // THEN Shares of Total Ever Received MINUS what has already been taken
        const payee0Data = {
          address: payees[0],
          canClaimAmount:
            (totalReceived * shares0.c[0]) / shares.c[0] - Ie(released0)
        }

        const payee1Data = {
          address: payees[1],
          canClaimAmount:
            (totalReceived * shares1.c[0]) / shares.c[0] - Ie(released1)
        }

        this.setState({
          balance: utils.fromWei(balance, 'ether'),
          payeeData: [payee0Data, payee1Data]
        })
      } else {
        console.error(err) // eslint-disable-line
      }
    })

    this.setState({
      canClaim: payees.indexOf(accounts[0]) >= 0
    })

    return instance
  }

  sendEtherToTestZep = () => {
    // @TODO set a notice that something is happening...
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
      .on('confirmation', () => {
        eth.getBalance(instance.address, (err, balance) => {
          if (!err) {
            // Right now this gets set 25 times to the same value...WOMP
            this.setState({
              balance: utils.fromWei(balance, 'ether')
            })
          } else {
            console.error(err) // eslint-disable-line
          }
        })
      })
      .on('error', err => {
        console.error('Tx Error', err) // eslint-disable-line
      })
  }

  updateTestZepBalance = () => {
    const { eth, utils } = this.props.web3
    const { instance } = this.state

    eth.getBalance(instance.address, (err, balance) => {
      if (!err) {
        this.setState({
          balance: utils.fromWei(balance, 'ether')
        })
      } else {
        console.error(err) // eslint-disable-line
      }
    })
  }

  claimEtherFromTestZep = async () => {
    // @TODO
    // - [x] Add check to see if there is anything for them to claim (perhaps
    // tied to calculating gas cost?)
    // - [ ] Update all values after claim...

    if (!this.state.canClaim) {
      return
    }

    const { accounts } = this.props
    const { instance, payeeData } = this.state
    const canClaimAmount = payeeData.filter(d => d.address === accounts[0])[0]
      .canClaimAmount

    if (canClaimAmount <= 0) {
      alert('No new money for you to claim bruv...')
    } else {
      try {
        // if this address is a payee then call claim...
        const claim = await instance.claim({ from: accounts[0] })
        console.log(claim) // eslint-disable-line
      } catch (err) {
        console.error('Claim was unssucesful I guess?', err) // eslint-disable-line
      }
    }
  }

  renderPayeeData() {
    const { accounts } = this.props
    const { payeeData } = this.state

    return (
      <Fragment>
        <h3 className="heading">Payee Addresses / Amounts they can claim</h3>
        <ul>
          {payeeData.map(data => {
            return (
              <li key={data.address}>
                <strong
                  className={
                    data.address === accounts[0] ? 'highlight' : undefined
                  }
                >
                  {data.address}
                </strong>
                :{' '}
                <code>
                  {data.canClaimAmount} {ETH}
                </code>
              </li>
            )
          })}
        </ul>
      </Fragment>
    )
  }

  render() {
    const { balance, canClaim, instance, payeeData } = this.state
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

          <h3 className="heading">Can Current Address Claim?</h3>
          <p>
            <strong className="highlight">{canClaim ? 'YES' : 'NO'}</strong>
          </p>

          {payeeData && this.renderPayeeData()}

          <h3 className="heading">Balance in Contract:</h3>
          <p>
            <code>
              {balance} {ETH}
            </code>
          </p>
          <div className="btn-group">
            <button
              onClick={this.updateTestZepBalance}
              className="btn"
              type="button"
            >
              Update TestZep Balance (
              <code>
                {numberBalance.toFixed(2)} {ETH}
              </code>
              )
            </button>
            <button
              onClick={this.sendEtherToTestZep}
              className="btn"
              type="button"
            >
              Send <code>0.05 {ETH}</code> to TestZepContract
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
