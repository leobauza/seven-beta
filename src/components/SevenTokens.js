import React, { Component, Fragment } from 'react'
// import SevenTokensContract from 'contracts/SevenTokens.json'
// import contract from 'truffle-contract'

export default class StoreValue extends Component {
  state = {
    intance: null
  }

  componentDidMount() {
    this.instantiateContract().then(instance => {
      this.setState({
        instance
      })
    })
  }

  async instantiateContract() {
    // const { currentProvider } = this.props.web3

    // const sevenTokens = contract(SevenTokensContract)
    // sevenTokens.setProvider(currentProvider)
    // const instance = await sevenTokens.deployed()
    // const result = await instance.get.call()

    // this.setState({
    //
    // })

    return 'placeholder'
    // return instance
  }

  render() {
    const { instance } = this.state

    if (instance) {
      return (
        <Fragment>
          <h2 className="heading">Seven ERC-721 Tokens</h2>
          <p>Future home of Seven Tokens UI</p>
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
