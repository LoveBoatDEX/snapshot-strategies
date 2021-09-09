# loveboat-governance 

This is the voting strategy for Love Boat Exchange (https://loveboat.exchange, Twitter: LoveBoatDEX)

This strategy counts a user's Love Token balance from the following places:
- XOLOVE Dividends contract
- LOVE Liquidity Provider contracts (LOVE LP contracts)
- If the user has LOVE LP tokens staked in a Love Boat Exchange rewards contract, it'll count that as well
- Delegated Love Token votes
- User's Love Token balance

Here is an example of parameters:

```json
{
  "address": "0x69bde563680f580a2da5b5d4e202eca4fdf35664",
  "symbol": "LOVE",
  "decimals": 18
}
```
