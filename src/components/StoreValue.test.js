import React from 'react'
import { shallow } from 'enzyme'
import StoreValue from './StoreValue'
import Web3 from 'web3'

const web3 = new Web3()

// @TODO
// - [ ] Learn how to write better Jest and Enzyme tests
// - [ ] How do you test or mock the saveValueToBlockchain method?

it('renders without crashing', () => {
  shallow(<StoreValue web3={web3} />)
})

it('Shows loading UI text', () => {
  const wrapper = shallow(<StoreValue web3={web3} />)
  expect(wrapper.contains(<h2>Loading UI...</h2>)).toEqual(true)
})

it('sets values correctly', () => {
  const wrapper = shallow(<StoreValue web3={web3} />)
  expect(wrapper.state('localValue')).toEqual(0)
  expect(wrapper.state('storedValue')).toEqual(0)

  const e = {
    target: {
      value: 10
    }
  }

  wrapper.instance().setLocalValue(e)
  expect(wrapper.state('localValue')).toEqual(10)
})
