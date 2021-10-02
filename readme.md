# Vite Extension

<div>
    <img src="https://vite-extension.surge.sh/screenshot.png" alt="vite" width=300 />
</div>

## Getting started

This guide will take you through setting up the extension in a local environment.

Start a local Vite node. The easiest way is to use the Solidity++ Visual Studio Code Extension as described [here](https://docs.vite.org/go-vite/tutorial/sppguide/introduction/installation.html#installing-the-visual-studio-code-extension). This should start a local node at http://127.0.0.1:9000.

Ensure you are using node 14+:

    $ nvm install 14
    $ nvm use 14

Clone repo and cd into it. Then, install node_modules:

    $ npm install

Start webpack build server:

    $ make

On a new tab, launch a chrome session pre-installed with the extension. The chrome session opens up in the `src/example` dapp at http://localhost:7777/example.html.

    $ make pack

# Features

### Popup

- [x] Create account
- [x] Import account
- [x] Add accounts in same derivation path scheme
- [ ] Network switch. Support mainnet and testnet.
- [x] Export private key
- [x] Export mnemonic
- [ ] Add custom tokens

### Injected script

- [x] Request connected accounts
- [x] Request connect new account + domain
- [x] Request createAccountBlock request
- [ ] Emit popup account changes

### Background

- [x] Load and subsribe to current account VITE balances

## Demo walk-through

https://youtu.be/JmufcGt_pic

## Production builds

To install a production ready build:
- Download the latest release from the [releases](https://github.com/0xkarl/vite-extension/releases) section. 
- Unzip the download.
- Head over to the Chrome extension section (`chrome://extensions/`) and enable `Developer mode`.
- Click `Load unpacked`.
- Select the unzipped folder of the build.
- This should successfully load the extension, and you can now access it from the browser extension's toolbar.
- For your safety, use a banner mnemonic phrase when importing a wallet for testing.

## Docs

https://0xkarl.github.io/vite-extension/getting-started/introduction.html

## Resources

- https://docs.vite.org/go-vite/tutorial/sppguide/introduction/installation.html
- https://docs.vite.org/vite.js/accountBlock/createAccountBlock.html
