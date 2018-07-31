## Using Truffle Console

`truffle console`

```js
SimpleStorage.deployed() // return the deployed contract...
.then(function(instance) {
  return instance.set(7); // call a method of the contract...
}).then(function(value) {
  return value.toString();
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
SimpleStorage.deployed().then(function(instance) {return instance.set(7);}).then(function(value) {return value.toString();});

// and

SimpleStorage.deployed().then(function(instance) {return instance.get.call();}).then(function(value) {return value.toString()});
```
