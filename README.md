# Ownft

Mint your own NFTs

## Development

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

### Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies

```
cd ownft
yarn install
```

2. Set the external Ownft contract's address and ABI in
   `packages/nextjs/contracts/externalContracts.ts`.

You can find the contract source
[here](https://github.com/programmer-ke/ownft-contract).

Upload it to the selected Ethereum chain (Sepolia / Base Sepolia /
Mainnet etc) then set its address and ABI.

3. Set the [Pinata](https://pinata.cloud/) credentials used to upload and pin the NFTs on IPFS.

In `packages/nextjs`:

```
mv .env.example .env
```

Then set the following from your Pinata account:

- `PINATA_JWT`
- `NEXT_PUBLIC_PINATA_GATEWAY`

4. On the terminal, start the NextJS app from the project root:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.

## Deployment

### Deploying the Contract

Deploy the contract to the selected network. See the [contract repository][repo] for more information.

[repo]: https://github.com/programmer-ke/ownft-contract

Update the external contract address/ABI as mentioned above.

### Deploying the Frontend

#### Vercel

✏️ Edit your frontend config in `packages/nextjs/scaffold.config.ts` to
change the `targetNetwork` to the selected network e.g
`chains.sepolia` or `chains.optimismSepolia`

💻 View your frontend at http://localhost:3000 and verify you see the correct network.

📡 When you are ready to ship the frontend app...

📦 Run `yarn vercel` to package up your frontend and deploy.

> You might need to log in to Vercel first by running `yarn vercel:login`.
> Once you log in (email, GitHub, etc), the default options should work.

> If you want to redeploy to the same production URL you can run `yarn
> vercel --prod`. If you omit the --prod flag it will deploy it to a
> preview/test URL.

> 🦊 Since we have deployed to a public testnet, you will now need to
> connect using a wallet you own or use a burner wallet. By default 🔥
> burner wallets are only available on hardhat . You can enable them
> on every chain by setting onlyLocalBurnerWallet: false in your
> frontend config (scaffold.config.ts in packages/nextjs/)

Set the environment variables listed in `packages/nextjs/.env.example`
in the Vercel Environment Config. You'll be prompted to redeploy for
them to take effect.
