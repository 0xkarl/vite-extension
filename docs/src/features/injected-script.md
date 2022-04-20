# Injected script

Similar to Metamask, the extension exposes a `window.vite` object that be used to interact with the Vite blockchain and connected accounts.

## Properties

### window.vite.request(args)

This submits RPC requests to the Vite blockchain. It returns a Promise that resolves to the result of the RPC method call. The `args` format is:

```js
{
  method: '',
  params: JSON.stringify({}) // options
}
```

where method can be:

### vite_accounts

Returns a list of the current connected account addresses. E.g.

```js
const [account] = await window.vite.request({
  method: 'vite_accounts',
});
console.log(account); // vite_553462bca137bac29f440e9af4ab2e2c1bb82493e41d2bc8b2
```

### vite_requestAccounts

It is the same as `vite_accounts` above, but prompts the user to connect the current account if not already done so.

```js
const [account] = await window.vite.request({
  method: 'vite_requestAccounts',
});
console.log(account); // vite_553462bca137bac29f440e9af4ab2e2c1bb82493e41d2bc8b2
```

<img src="https://vite-extension.surge.sh/app_screenshots/connect.png" alt="vite" width=300 />

### vite_createAccountBlock

Similar to `vite_sendTransaction` on MetaMask. This prompts the user to confirm an account block transaction. Once the user confirms the transaction, it proceeds to sign and broadcast the transaction to the current network blockchain. For example, an operation to interact with a deployed contract would be:

```js
const result = await window.vite.request({
  method: 'vite_createAccountBlock',
  params: {
    type: 'callContract',
    params: JSON.stringify({
      abi: CONTRACT_ABI,
      methodName: 'transferVite',
      amount: Number(viteAmount * 1e18).toString(),
      toAddress: smartContractAddress,
      params: [toAddress],
    }),
  },
});
```

<img src="https://vite-extension.surge.sh/app_screenshots/confirm_tx.png" alt="vite" width=300 />

### vite_chainId

Returns the `chainId` of the current network as a hexadecimal.
- `0x1` (`1`) means mainnet.
- `0x2` (`2`) means testnet.
- `0x3` (`3`) means debug/localnet.

```js
const chainIdHex = await window.vite.request({
  method: 'vite_chainId',
}); // 0x1
console.log(parseInt(chainIdHex)); // 1
```

## Events


### accountsChanged

Triggered when selected account changes.

```js
await window.vite.on('accountsChanged', (accounts) => {
  console.log(accounts); // ['vite_553462bca137bac29f440e9af4ab2e2c1bb82493e41d2bc8b2']
});
```

### chainChanged

Triggered when current network is changed.

```js
await window.vite.on('chainChanged', (chainId) => {
  console.log(parseInt(chainIdHex)); // 1
});
```