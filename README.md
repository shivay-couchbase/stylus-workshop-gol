# The Power of Stylus: A Rust and Solidity Smart Contract Hands-On Workshop

![cover](./workshop-cover.png)

## GitHub Codespaces

[![Open in Codespaces](https://img.shields.io/badge/Open%20in-GitHub%20Codespaces-blue?logo=github&logoColor=white&style=for-the-badge)](https://codespaces.new/hummusonrails/stylus-workshop-gol/tree/master)

If using GitHub Codespaces, just click on the button above, and if you already have a GitHub account, you can get into an environment that "just works"!

## Requirements
- [pnpm](https://pnpm.io/installation)
- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [rust](https://rustup.rs/)
- [foundry](https://book.getfoundry.sh/getting-started/installation)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Nitro-devnode](https://github.com/OffchainLabs/nitro-devnode?tab=readme-ov-file#usage)

## Getting started
- `rustup update stable` update the rust version
- `rustup target add wasm32-unknown-unknown` add WebAssembly target

### Step 1: Setup
- `git checkout step-1-setup` let's have a look around
- `pnpm install -r`
-  `cd apps/contracts-stylus`   `cargo stylus check`

### Step 2: Game of Life Stylus Contract
- `git checkout step-2-stylus-contract` let's implement a Game Of Life with Stylus
- `pnpm install -r` install all the dependencies in all the `apps`
-  `cd apps/contracts-stylus`   `cargo stylus check`
-  `src/lib.rs`

### Step 3: Frontend
- `git checkout step-3-frontend` let's put together a frontend
- `pnpm install -r` install all the dependencies in all the `apps`
-  `cd apps/contracts-stylus`   `cargo stylus check`

### Step 4: Solidity Contract
- `git checkout step-4-solidity-contract` let's have a look to the equivalent implementation in Solidity
-  `src/NFT.sol`
-  `cd apps/contracts-stylus`   `cargo stylus check`

### Step 5: Solidity + Stylus Contract
- `git checkout master` you go back to the end result
- `pnpm install -r` install all the dependencies in all the `apps`
-  `src/StylusNFT.sol`
-  `cd apps/contracts-stylus`   `cargo stylus check`

## Workspace shortcuts
Basic commands to run the project across the different apps.

### Frontend
- `pnpm --filter frontend dev` start the development server
- `pnpm --filter frontend build` build for production
- `pnpm --filter frontend test` run tests
- `pnpm --filter frontend lint` run linting
- configure a local network in your wallet with the following:
  - name: Localhost-Nitro
  - RPC URL: http://localhost:8547
  - Chain ID: 412346
  - Currency Symbol: ETH
- Nitro comes with `0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E` and the private key `0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659` with ETH preloaded 
- Below are a few addresses to use for testing. Run the `scripts/funds.sh` script to fund them with ETH from the master account.

- (0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (1 ETH)
- (1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (1 ETH)
- (2) 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (1 ETH)
- (3) 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (1 ETH)
- (4) 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (1 ETH)
- (5) 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc (1 ETH)
- (6) 0x976EA74026E726554dB657fA54763abd0C3a0aa9 (1 ETH)
- (7) 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955 (1 ETH)
- (8) 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f (1 ETH)
- (9) 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 (1 ETH)

Testing Private Keys 
==================
- (0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
- (1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
- (2) 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
- (3) 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
- (4) 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
- (5) 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
- (6) 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
- (7) 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
- (8) 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
- (9) 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

**Notice: Do not use these keys in production or put funds in them. They are for testing purposes only.**

### Contracts
Before running contract commands, make sure you have a local Ethereum node running:
- `git clone git clone https://github.com/OffchainLabs/nitro-devnode.git in apps` (TODO add a postinstall script to clone the repo)
- `./apps/nitro-devnode/run-dev-node.sh` start a local Nitro node 

Then you can run:
- `pnpm --filter contracts-stylus check` verify and compile the contract
- `pnpm --filter contracts-stylus test` runs the tests for the contract
- `pnpm --filter contracts-stylus test:integration` runs the integration tests for the contract
- `pnpm --filter contracts-stylus deploy:local` deploy the contract to the local network

### Contracts-solidity
- `pnpm --filter contracts-solidity build` build the contracts
- `pnpm --filter contracts-solidity test` run the tests
- `pnpm --filter contracts-solidity deploy:local` deploy the contract to the local network

TODO:
- Make it works `cargo stylus export-abi`
- Update to Stylus SDK 0.8.0