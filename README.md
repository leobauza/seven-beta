## MetaMask Common Issues

- When in doubt go to Settings > Reset Account

## Symlink contracts because create-react-app says so

`cd node_modules`

`ln -s ../build/contracts contracts`

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
