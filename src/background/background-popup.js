import { wallet, accountBlock } from '@vite/vitejs';
import {
  store,
  cache,
  getDomainAccounts,
  switchNetwork,
  setupBalances,
  fmtBig,
  getTransactions,
  broadcastAccountChange,
  cachePendingTxn,
  cacheCompletedTxn,
  getTxBlockExplorerUrl,
  getNetworks,
  uuid,
} from './utils';
import { toBig } from '../popup/utils';

export default async ({ name, payload }) => {
  console.log('p %s', name);
  switch (name) {
    case 'boot': {
      if (store.password) {
        return unlock();
      } else {
        const addresses = cache('addresses') || [];
        const addressesInfo = cache('addressesInfo') || {};
        const currentAccountIndex = cache('currentAccountIndex');
        store.locked = true;
        return {
          isReady: true,
          error: null,
          locked: store.locked,
          addresses,
          addressesInfo,
          currentAccountIndex,
          address: addresses[currentAccountIndex],
        };
      }
    }

    case 'unlock': {
      store.password = payload.password;
      return unlock();
    }

    case 'register': {
      store.password = payload.password;
      const mnemonic = wallet.createMnemonics();
      const encryptedMnemonic = window.CryptoJS.AES.encrypt(
        mnemonic,
        store.password
      ).toString();
      const currentAccountIndex = 0;
      store.mnemonic = mnemonic;
      store.locked = false;
      store.wallet = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: currentAccountIndex,
      });

      const addresses = [store.wallet.address];
      const addressesInfo = {
        [store.wallet.address]: { name: `Account ${currentAccountIndex + 1}` },
      };

      cache('encryptedMnemonic', encryptedMnemonic);
      cache('currentAccountIndex', currentAccountIndex);
      cache('addresses', addresses);
      cache('addressesInfo', addressesInfo);

      setupBalances();

      return {
        locked: store.locked,
        address: store.wallet.address,
        addresses,
        addressesInfo,
      };
    }

    case 'importAccount': {
      store.password = payload.password;
      store.mnemonic = payload.mnemonic;
      store.locked = false;

      const currentAccountIndex = 0;
      store.wallet = wallet.deriveAddress({
        mnemonics: store.mnemonic,
        index: currentAccountIndex,
      });

      const addresses = [store.wallet.address];
      const addressesInfo = {
        [store.wallet.address]: { name: `Account ${currentAccountIndex + 1}` },
      };

      const encryptedMnemonic = window.CryptoJS.AES.encrypt(
        store.mnemonic,
        store.password
      ).toString();

      cache('encryptedMnemonic', encryptedMnemonic);
      cache('currentAccountIndex', currentAccountIndex);
      cache('addresses', addresses);
      cache('addressesInfo', addressesInfo);

      setupBalances();

      return {
        locked: store.locked,
        address: store.wallet.address,
        addresses,
        addressesInfo,
      };
    }

    case 'lock': {
      store.password = null;
      store.locked = true;
      return {
        locked: store.locked,
      };
    }

    case 'logOut': {
      store.password = null;
      store.locked = true;
      cache('encryptedMnemonic', null);
      cache('currentAccountIndex', null);
      cache('addresses', []);
      cache('addressesInfo', {});
      return {
        locked: store.locked,
        addresses: [],
        addressesInfo: {},
        currentAccountIndex: null,
        address: null,
      };
    }

    case 'createAccount': {
      const { mnemonic } = store;
      const addresses = cache('addresses') || [];
      const addressesInfo = cache('addressesInfo') || {};
      const currentAccountIndex = addresses.length;

      store.wallet = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: currentAccountIndex,
      });
      const { address } = store.wallet;
      addresses.push(address);
      addressesInfo[address] = { name: `Account ${currentAccountIndex + 1}` };

      cache('currentAccountIndex', currentAccountIndex);
      cache('addresses', addresses);
      cache('addressesInfo', addressesInfo);

      setupBalances();

      return {
        currentAccountIndex,
        addresses,
        addressesInfo,
        address,
      };
    }

    case 'switchAccount': {
      const { address } = payload;
      const { mnemonic } = store;

      const addresses = cache('addresses');

      const currentAccountIndex = addresses.indexOf(address);
      store.wallet = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: currentAccountIndex,
      });
      cache('currentAccountIndex', currentAccountIndex);

      broadcastAccountChange();
      setupBalances();

      return {
        currentAccountIndex,
        address,
      };
    }

    case 'getBalances': {
      const { totalUSDBalance, balances, unreceived } = store;
      return {
        totalUSDBalance,
        balances,
        unreceived,
      };
    }

    case 'getNetwork': {
      const { network } = store;
      return {
        network,
        networks: getNetworks(),
      };
    }

    case 'switchNetwork': {
      const { network } = payload;
      switchNetwork(network);
      setupBalances();
      return {
        network,
      };
    }

    case 'accountConnected': {
      const {
        tabId,
        id,
        jsonrpc,
        data: { origin, address },
      } = payload;
      const domains = cache('domains') || {};
      domains[origin] = domains[origin] || {};
      domains[origin].accounts = domains[origin].accounts || [];
      // domains[origin].accounts.push(address);
      domains[origin].accounts = [address];
      cache('domains', domains);
      chrome.tabs.sendMessage(tabId, {
        target: 'vite-contentscript',
        data: {
          name: 'metamask-provider',
          data: {
            id,
            jsonrpc,
            result: [address],
          },
        },
      });
      return {};
    }

    case 'result': {
      const { tabId, id, jsonrpc, result } = payload;
      chrome.tabs.sendMessage(tabId, {
        target: 'vite-contentscript',
        data: {
          name: 'metamask-provider',
          data: {
            id,
            jsonrpc,
            result,
          },
        },
      });
      return {};
    }

    case 'error': {
      const { tabId, id, jsonrpc, error } = payload;
      chrome.tabs.sendMessage(tabId, {
        target: 'vite-contentscript',
        data: {
          name: 'metamask-provider',
          data: {
            id,
            jsonrpc,
            error,
          },
        },
      });
      return {};
    }

    case 'getAccountIsConnectedToDomain': {
      const { origin } = payload;
      const accounts = getDomainAccounts(origin);
      return { connected: !!accounts.length };
    }

    case 'getMnemonic': {
      const { mnemonic } = store;
      return { mnemonic };
    }

    case 'sendToken': {
      const {
        wallet: { address, privateKey },
        client,
      } = store;
      const { tokenId, recipient, amount, decimals, data = null } = payload;
      const block = accountBlock.createAccountBlock('send', {
        address,
        toAddress: recipient,
        tokenId,
        // tokenId: 'Vite_TokenId',
        amount: toBig(amount).times(Math.pow(10, decimals)).toString(),
        // data,
      });

      block.setProvider(client).setPrivateKey(privateKey);
      await block.autoSetPreviousAccountBlock();
      const result = await block.sign().send();

      const hash = result.hash;

      // tx.wait().then(() => {
      //   cacheCompletedTxn(hash);
      // });

      // cachePendingTxn(store.wallet.address, nonce, {
      //   description: `Send ${token}`,
      //   value,
      //   token,
      //   hash,
      // });
      // cachePendingTxn(to, nonce, {
      //   description: `Receive ${token}`,
      //   value,
      //   token,
      //   hash,
      // });

      const txBlockExplorerUrl = getTxBlockExplorerUrl(hash);
      return { txBlockExplorerUrl, hash };
    }

    case 'confirmTx': {
      const {
        wallet: { address, privateKey },
        client,
      } = store;
      const { type, params } = payload;

      const block = accountBlock
        .createAccountBlock(type, {
          ...params,
          address,
        })
        .setProvider(client)
        .setPrivateKey(privateKey);
      await block.autoSetPreviousAccountBlock();
      const result = await block.sign().send();

      return result;
    }

    case 'waitForTx': {
      // const { hash } = payload;
      // await store.provider.waitForTransaction(hash);
      // cacheCompletedTxn(hash);
      return {};
    }

    case 'getTransactions': {
      const transactions = await getTransactions();
      return { transactions };
    }

    case 'saveAccountName': {
      const addressesInfo = cache('addressesInfo') || {};
      const { address, name } = payload;
      addressesInfo[address] = addressesInfo[address] || {};
      addressesInfo[address].name = name;
      cache('addressesInfo', addressesInfo);
      return { addressesInfo };
    }

    case 'exportPrivateKey': {
      const { pass, address } = payload;
      if (pass !== store.password) {
        throw new Error("Pass doesn't match");
      }
      const { mnemonic } = store;
      const addresses = cache('addresses');
      const accountIndex = addresses.indexOf(address);
      const { privateKey } = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: accountIndex,
      });
      return { exportedPrivateKey: privateKey };
    }

    case 'receiveToken': {
      const {
        wallet: { address, privateKey },
        client,
      } = store;
      const { sendBlockHash } = payload;

      const block = accountBlock.createAccountBlock('receive', {
        address,
        sendBlockHash,
      });

      block.setProvider(client).setPrivateKey(privateKey);
      await block.autoSetPreviousAccountBlock();
      const result = await block.sign().send();

      const hash = result.hash;

      // tx.wait().then(() => {
      //   cacheCompletedTxn(hash);
      // });

      // cachePendingTxn(store.wallet.address, nonce, {
      //   description: `Send ${token}`,
      //   value,
      //   token,
      //   hash,
      // });
      // cachePendingTxn(to, nonce, {
      //   description: `Receive ${token}`,
      //   value,
      //   token,
      //   hash,
      // });

      const txBlockExplorerUrl = getTxBlockExplorerUrl(hash);
      return { txBlockExplorerUrl, hash };
    }

    case 'addNetwork': {
      const networks = cache('networks') || [];
      for (let i = 0; i < networks.length; i++) {
        const n = networks[i];
        if (n.name === payload.name) {
          throw new Error('A network exists with that name...');
        }
      }
      const id = uuid();
      const network = { id, ...payload };
      cache('networks', [...networks, network]);
      switchNetwork(id);
      return {};
    }

    default:
      throw new Error(`unhandled action: ${name}`);
  }
};

function unlock() {
  const encryptedMnemonic = cache('encryptedMnemonic');
  const addresses = cache('addresses') || [];
  const currentAccountIndex = cache('currentAccountIndex');
  const addressesInfo = cache('addressesInfo') || {};
  let mnemonic;
  try {
    mnemonic = window.CryptoJS.AES.decrypt(
      encryptedMnemonic,
      store.password
    ).toString(window.CryptoJS.enc.Utf8);
  } catch (e) {
    store.password = null;
    throw new Error('Wrong pass');
  }
  store.mnemonic = mnemonic;
  store.wallet = wallet.deriveAddress({
    mnemonics: mnemonic,
    index: currentAccountIndex,
  });
  store.locked = false;

  setupBalances();

  return {
    isReady: true,
    locked: store.locked,
    address: store.wallet.address,
    currentAccountIndex,
    addresses,
    addressesInfo,
  };
}
