import Web3 from 'web3'

export const Ie = bigNumber => {
  if (typeof bigNumber !== 'string') {
    bigNumber = bigNumber.toString()
  }

  return Number.parseFloat(Web3.utils.fromWei(bigNumber, 'ether'))
}
