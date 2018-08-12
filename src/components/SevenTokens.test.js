import React from 'react'
import { shallow } from 'enzyme'
import SevenTokens from './SevenTokens'
import Web3 from 'web3'

it('renders without crashing', () => {
  const web3 = new Web3()
  shallow(<SevenTokens web3={web3} />)
})
