// import { strategy as erc20BalanceOfStrategy } from '../erc20-balance-of';
// import { getDelegations } from '../../utils/delegation';
// import { BigNumber } from '@ethersproject/bignumber';

export const author = 'kevinpark';
export const version = '0.1.0';

// const TWO = BigNumber.from(2);
// const THREE = BigNumber.from(3);

// export async function strategy(
//   space,
//   network,
//   provider,
//   addresses,
//   options,
//   snapshot
// ) {
//   const delegations = await getDelegations(
//     space,
//     network,
//     provider,
//     addresses,
//     options,
//     snapshot
//   );
//   if (Object.keys(delegations).length === 0) return {};
//   console.debug('Delegations', delegations);

//   const score = await erc20BalanceOfStrategy(
//     space,
//     network,
//     provider,
//     Object.values(delegations).reduce((a: string[], b: string[]) =>
//       a.concat(b)
//     ),
//     options,
//     snapshot
//   );
//   console.debug('Delegators score', score);

//   return Object.fromEntries(
//     addresses.map((address) => {
//       const addressScore = delegations[address]
//         ? delegations[address].reduce((a, b) => a + score[b], 0)
//         : 0;
//       return [address, addressScore];
//     })
//   );
// }
// import { BigNumberish } from '@ethersproject/bignumber';
// import { formatUnits } from '@ethersproject/units';
import { /*Multicaller,*/ multicall } from '../../utils';

// const abi = [
//   'function balanceOf(address account) external view returns (uint256)'
// ];
// const abi = [
//   'function LOVEBalance(address account) external view returns (uint256)'
// ];
// export async function strategy(
//   space,
//   network,
//   provider,
//   addresses,
//   options,
//   snapshot
// ): Promise<Record<string, number>> {
//   const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';

//   const multi = new Multicaller(network, provider, abi, { blockTag });
//   addresses.forEach((address) =>
//     multi.call(address, options.address, 'balanceOf', [address])
//   );
//   const result: Record<string, BigNumberish> = await multi.execute();

//   return Object.fromEntries(
//     Object.entries(result).map(([address, balance]) => [
//       address,
//       parseFloat(formatUnits(balance, options.decimals))
//     ])
//   );
// }

// export async function xoLoveStrategy(
// export async function strategy(
//   space,
//   network,
//   provider,
//   addresses,
//   options,
//   snapshot
// ): Promise<Record<string, number>> {
//   const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';

//   const multi = new Multicaller(network, provider, abi, { blockTag });
//   addresses.forEach((address) =>
//     multi.call(
//       address,
//       '0x38a09EF7300becc2dE6824423C8AB5C9b93e418c',
//       'LOVEBalance',
//       [address]
//     )
//   );
//   const result: Record<string, BigNumberish> = await multi.execute();

//   return Object.fromEntries(
//     Object.entries(result).map(([address, balance]) => [
//       address,
//       parseFloat(formatUnits(TWO.mul(balance), options.decimals))
//     ])
//   );
// }
const tokenAbi = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

// 0x27e70ed8ff2f3abca58503a323ca72adfc2712c0 LOVE USDC Rewards contract
// 0x10838EF3DEf20f6F5Dd963c3E9E510971ee4CA4F LOVE USDC LOVE LP contract
const loveUsdcLPAddr = '0x10838EF3DEf20f6F5Dd963c3E9E510971ee4CA4F';
const loveUsdcRewardsAddr = '0x27E70eD8FF2f3ABCA58503A323cA72adFc2712C0';

const loveMaticLPAddr = '0x8bc6F4b90129b26Efb0E52C2B51E5B1782ca29Ad';
const loveMaticRewardsAddr = '0x1eC753dE7B88C5F2a3ab143642495A5ee2221FBf';

export async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
): Promise<Record<string, number>> {
  const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
  const res = await multicall(
    network,
    provider,
    tokenAbi,
    [
      [loveUsdcLPAddr, 'totalSupply', []],
      [options.address, 'balanceOf', [loveUsdcLPAddr]] // balance of Love in LOVE LP contract
    ]
      .concat(
        addresses.map((address: any) => [
          loveUsdcRewardsAddr,
          'balanceOf',
          [address]
        ])
      )
      .concat(
        [
          [loveMaticLPAddr, 'totalSupply', []],
          [options.address, 'balanceOf', [loveMaticLPAddr]] // balance of Love in LOVE LP contract
        ].concat(
          addresses.map((address: any) => [
            loveMaticRewardsAddr,
            'balanceOf',
            [address]
          ])
        )
      ),
    { blockTag }
  );

  const numberOfAddresses = addresses.length;
  console.log(numberOfAddresses);

  let totalSupply;
  let tokenBalanceInLP;
  let tokensPerLP;

  let responseRaw!: number[];

  // Derived response
  let responseDer!: number[];

  let responses!: number[];

  // Loop through LOVE LP Love Token pairs.
  for (let i = 0; i < 2; i++) {
    console.log(`i is = ${i}`);

    totalSupply = i == 0 ? res[0] : res[3 + i * numberOfAddresses];
    tokenBalanceInLP = i == 0 ? res[1] : res[4 + i * numberOfAddresses];
    tokensPerLP =
      tokenBalanceInLP / 10 ** options.decimals / (totalSupply / 1e18);

    responseRaw =
      i == 0
        ? res.slice(2, numberOfAddresses + 2)
        : res.slice(
            3 + numberOfAddresses * i,
            3 + numberOfAddresses * i + numberOfAddresses
          );

    responseDer = responseRaw.map(
      (userInfo) => (userInfo / 10 ** options.decimals) * tokensPerLP
    );

    if (i == 0) {
      // First response.
      responses = responseDer;
    } else if (i > 0) {
      // Add previous response to itself.
      responses = responses.map((responses, k) => {
        console.log(
          `In the else if loop ${i}: "old" responses: ${responses}, "current" responseDer: ${responseDer[k]}`
        );
        console.log(responses + responseDer[k]);
        return responses + responseDer[k];
      });
    }
  }

  return Object.fromEntries(
    responses.map((userInfo, j) => [addresses[j], userInfo])
  );
}

/// For all Love rewards contracts
// Check rewards contract for user balanceOf respective LOVE LP Token

// Have a balance? Take note.

// No balance? Move to next step

// 2nd, check all LOVE LP Love pair contracts for user's balance of that token

// Add LOVE LPs in rewards contracts and user's balance of LOVE LPs

// Calculate underlying balance of Love
