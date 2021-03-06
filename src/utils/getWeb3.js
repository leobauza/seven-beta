import Web3 from 'web3'

const getWeb3 = new Promise(function(resolve) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    let results
    let web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      results = {
        web3: web3
      }

      console.log('Injected web3 detected.') // eslint-disable-line

      resolve(results)
    } else {
      /**
       * Code for getting future MetaMask Ethereum provider on November 2nd
       */
      // Listen for provider injection
      window.addEventListener('message', ({ data }) => {
        if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
          // Use injected provider, start dapp...
          console.log('MESSAGE', data) // eslint-disable-line
          // web3 = new Web3(ethereum);
        }
      })
      // Request provider
      window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*')

      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      let provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')

      web3 = new Web3(provider)

      results = {
        web3: web3
      }

      console.log('No web3 instance injected, using Local web3.') // eslint-disable-line

      resolve(results)
    }
  })
})

export default getWeb3
