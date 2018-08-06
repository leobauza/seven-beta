import React, { Fragment } from 'react'
import snarkdown from 'snarkdown'

const body = [
  '<p>This is a collection of mini decentralized applications. Locally, these can be run with [ganache](https://truffleframework.com/ganache) (a personal Ethereum blockchain for development purposes). This Project makes use of the [Truffle Framework](https://truffleframework.com/). Truffle provides smart contract management.</p>',
  '- __Store Value:__ The simplest dApp. Just stores a value on the blockchain',
  '- __Deposit/Claim:__ An implementation of [OpenZepplin\'s](#) SplitPayment contract. Anyone can add ether to the contract, but only the payees can withdraw (according to how many shares they hold)', // eslint-disable-line
  '- __Sever ERC-721 Tokens:__ An implementaion of a standard ERC-721 token with only 7 tokens'
].join('\n')

const createMarkup = md => {
  return { __html: snarkdown(md) }
}

const Home = () => (
  <Fragment>
    <h2 className="heading">Home</h2>
    <div dangerouslySetInnerHTML={createMarkup(body)} />
  </Fragment>
)

export default Home
