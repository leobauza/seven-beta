# Seven Beta

## WIP contract structure

```js
/**
 * Entry (pseudo code)
 * entry tx sent to the game contract `payEntryFee(game_id, player_id, payment)`.
 * Questions:
 * - How to actually pay to a contract?
 */
{
  game_id: 0,
  player: "<some ethereum address>",
  amount: "<some ethereum amount>"
}

/**
 *
 */

/**
 * Game Contract
 * - Keeps track of game ID and players participating
 * - Distributes the entry fees to the POT, and to founder/investor addresses
 * (@ end of entry period to minimize gas costs?)
 * - Accepts entries `payEntryFee`
 * - Determines if player is winner `claimToken` or `claimPot`
 */


/**
 * POT contract (?)
 * - Holds the money
 */
```
