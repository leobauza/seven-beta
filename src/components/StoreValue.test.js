import React from 'react'
import { shallow } from 'enzyme'
import StoreValue from './StoreValue'
import Web3 from 'web3'

// @TODO
// - [ ] Learn how to write better Jest and Enzyme tests
// - [ ] How do you test or mock the saveValueToBlockchain method?
describe('<StoreValue />', () => {
  let wrapper
  let provider
  let web3

  beforeAll(() => {
    provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
    web3 = new Web3(provider)
    wrapper = shallow(<StoreValue web3={web3} />)
  })

  it('Shows loading UI text', () => {
    expect(wrapper.contains(<h2>Loading UI...</h2>)).toEqual(true)
  })

  it('sets values correctly', () => {
    const e = {
      target: {
        value: 10
      }
    }

    wrapper.instance().handleLocalValueChange(e)
    expect(wrapper.state('localValue')).toEqual(10)
  })

  describe('After contract instantiation', () => {
    let instance

    beforeAll(() => {
      instance = wrapper.instance().instantiateContract()
    })

    it('creates a contract instance with get and set', () => {
      expect.assertions(3)
      return instance.then(() => {
        const contract = wrapper.state('instance')
        expect(contract.hasOwnProperty('methods')).toBeTruthy()
        expect(contract.methods.hasOwnProperty('get')).toBeTruthy()
        expect(contract.methods.hasOwnProperty('set')).toBeTruthy()
      })
    })

    it('shows ui text once a contract exists', () => {
      expect.assertions(1)
      return instance.then(() => {
        expect(
          wrapper.contains(<h2 className="heading">Store A Value</h2>)
        ).toEqual(true)
      })
    })
  })
})
