import React from 'react'
import { shallow } from 'enzyme'
import StoreValue from './StoreValue'
import Web3 from 'web3'

// @TODO
// - [~] Learn how to write better Jest and Enzyme tests
// - [~] How do you test or mock the saveValueToBlockchain method?
let e
let instance
let mockContract
let provider
let web3
let wrapper

beforeAll(() => {
  provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
  web3 = new Web3(provider)
  wrapper = shallow(<StoreValue web3={web3} setNotice={() => {}} />)
  instance = wrapper.instance()
  instance.sendTxWithGas = jest.fn().mockReturnValue({ transactionHash: '0x0' })
  wrapper.update()
  mockContract = val => {
    return {
      methods: {
        get: () => {
          return {
            call: jest.fn().mockReturnValue(val)
          }
        }
      }
    }
  }
  e = {
    target: {
      value: 10
    },
    preventDefault: () => {}
  }
})

it('initially shows loading UI', () => {
  expect(wrapper.contains(<h2>Loading UI...</h2>)).toEqual(true)
})

it('handles local value change', () => {
  // @TODO replace with fill out form and submit (?)
  instance.handleLocalValueChange(e)
  expect(wrapper.state('localValue')).toEqual('10')
})

it('updates storedValue after saving to blockchain', () => {
  const NEW_VAL = '34'

  wrapper.setState({
    localValue: '0',
    instance: mockContract(NEW_VAL)
  })

  // @TODO replace with fill out form and submit (?)
  instance.saveValueToBlockchain(e).then(result => {
    expect(result).toBe(false)
  })

  wrapper.setState({
    localValue: NEW_VAL,
    isStoredValueUpdated: false
  })

  // @TODO replace with fill out form and submit (?)
  instance.saveValueToBlockchain(e).then(result => {
    expect(result).toBe(false)
  })

  wrapper.setState({
    isStoredValueUpdated: true
  })

  // @TODO replace with fill out form and submit (?)
  instance.saveValueToBlockchain(e).then(() => {
    expect(wrapper.state('storedValue')).toBe(NEW_VAL)
    expect(wrapper.state('isStoredValueUpdated')).toBeTruthy()
  })
})

describe('contract instantiation', () => {
  beforeAll(async () => {
    await wrapper.instance().instantiateContract()
  })

  it('checks contract is instantiated', () => {
    expect.assertions(1)
    const contract = wrapper.state('instance')
    expect(
      contract.hasOwnProperty('methods') &&
        contract.methods.hasOwnProperty('get') &&
        contract.methods.hasOwnProperty('set')
    ).toBeTruthy()
  })

  it('shows ui text once a contract exists', () => {
    expect.assertions(1)
    expect(
      wrapper.contains(<h2 className="heading">Store A Value</h2>)
    ).toEqual(true)
  })
})
