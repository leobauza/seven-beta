# Seven Beta

## WIP contract structure

### Game contract:

  a. Keeps track of the number of games
  b. Keeps track of players in a given game
  c. Accepts entries and distributes payments to a pot and to founder wallets
  d. ??

Pseudo code of the contract:

```js
class Game {
  game_id: 0 // gets incremented (@TODO how?)

  payEntryFee(game_id, player_id, payment) {
    // distributes payment to funder wallets and "the pot"
    // preferably holds off on doing the distributing until the start of a game to reduce gas costs? (@TODO possible?)
  }

  /**
   * - Determines if player is winner `claimToken` or `claimPot`
   */
}
```

### Pot contract

```js
/**
 * POT contract (?)
 * - Holds the money
 */
```

### Entry Payload:

Presumably this would hit `payEntryFee` on the `GameContract`

Questions: (@TODO)

- How do you pay a contract? and how does a contract do anything with that payemnt?

```js
{
  game_id: 0,
  player: "<some ethereum address>",
  amount: "<some ethereum amount>"
}
```

### Big Questions

1. How to determine the entry fee in USD, then calculate it in ether, and make sure it is right when being accepted as an entry fee by the contract?
2. Can we accept entry fees off chain and only settle them all in a single transaction when the game (or phase of game) starts?
