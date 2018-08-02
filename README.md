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

When you run into issues pray and tell yourself everything will be alright

## MetaMask Common Issues

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

## Testing

Yeah right...
