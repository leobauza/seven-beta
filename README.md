## Get Started

You will need [Truffle](https://truffleframework.com/) and [Ganache](https://truffleframework.com/ganache)

To install truffle globally first make sure you are using the right node version:

```bash
nvm use
```

```bash
npm install -g truffle
```

Install your deps so compilations work:

```
yarn
```

Make sure Ganache is running and then compile and migrate the contracts:

```bash
truffle compile
truffle migrate
```

Symlink contracts because create-react-app says so and there is no gosh

```bash
cd node_modules
ln -s ../build/contracts contracts
```

You did it, you can now start the webserver

```
yarn start
```

You will need MetaMask. From the network dropdown choose Custom RPC and enter the RPC server displayed in Ganache. You can also use the Mnemonic from Ganache as the seed to view your accounts.

When you run into issues pray and tell yourself everything will be alright

## MetaMask Common Issues

- Did you choose the right network?
- Did you enter your mnemonic for the most recent time you restarted Ganache?
- When in doubt go to Settings > Reset Account

## Using Truffle Console

`truffle console`

```js
SimpleStorage.deployed() // return the deployed contract...
.then(function(instance) {
  return instance.set(7); // call a method of the contract...
}).then(function(value) {
  return value;
});
```

```js
SimpleStorage.deployed()
.then(function(instance) {
  return instance.get.call();
}).then(function(value) {
  return value.toString()
});
```

Copy Paste Friendly:

```js
SimpleStorage.deployed().then(function(instance) {return instance.set(2);}).then(function(value) {return value;});

// and

SimpleStorage.deployed().then(function(instance) {return instance.get.call();}).then(function(value) {return value.toString()});
```

## What is actually happening (ie. The Stack)

I need to wrap my head around working in Ethereum so hopefully writing it down helps.

### Ganache

Ganache is just a local ethereum node with an RPC server @ http://127.0.0.1:7545

### MetaMask's Role

MetaMask injects their own provider (using the [provider engine](https://github.com/MetaMask/provider-engine)). They do this to intercept certain RPC calls for [example](https://github.com/MetaMask/provider-engine/blob/master/subproviders/hooked-wallet.js#L109), where they intercept the `sendTransaction` call and do their own signing and stuff on MetaMask.

Also worth noting [this github comment](https://github.com/MetaMask/metamask-extension/issues/2350#issuecomment-374717425) explaining the state of things with subproviders and why MetaMask doesn't support websockets yet

### Front End

React App connects to a web3 instance provided by MetaMask usually (`src/utils/getWeb3.js`). Though one could manually connect to the node like so:

```js
// RANDOM JSON RPC TEST
// Create a web3 provider: the Ganache node (but this could be your own full node or whatever)
const clientProvider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
// Create a client using the given provider: this is gives us the abstractions
// of the Javascript JSON RPC API (https://github.com/ethereum/wiki/wiki/JSON-RPC#javascript-api)
const client = new Web3(clientProvider)
// Use the abstractions to do stuff...
client.eth.getAccounts().then(accounts => console.log(accounts))
```

Or somehow modify the above to use MetaMask's provider engine to do fancier stuff.

## Testing

Yeah right...
