import React from 'react'
import { shallow } from 'enzyme'
import App from './App'

describe('<App />', () => {
  let wrapper

  beforeAll(() => {
    wrapper = shallow(<App />)
  })

  it('shows loading UI text', () => {
    expect(wrapper.contains(<p>Accounts Are Loading!</p>)).toEqual(true)
  })

  it('shows a notice in the UI', () => {
    wrapper.instance().setNotice(<p>My Notice!</p>)
    expect(wrapper.contains(<p>My Notice!</p>)).toEqual(true)
  })
})
