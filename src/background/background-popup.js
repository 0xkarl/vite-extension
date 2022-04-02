import { wallet, accountBlock, utils } from '@vite/vitejs';
import pwd from 'browser-passworder';
import {
  store,
  cache,
  getDomainAccounts,
  switchNetwork,
  setupBalances,
  getTransactions,
  broadcastAccountChange,
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
        return await unlock();
      } else {
        const addresses = (await cache('addresses')) || [];
        const addressesInfo = (await cache('addressesInfo')) || {};
        const currentAccountIndex = await cache('currentAccountIndex');
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
      return await unlock();
    }

    case 'register': {
      const { password } = payload;
      let mnemonic, encryptedMnemonic, w;
      try {
        mnemonic = wallet.createMnemonics();
        encryptedMnemonic = await pwd.encrypt(password, mnemonic);
        w = wallet.deriveAddress({
          mnemonics: mnemonic,
          index: currentAccountIndex,
        });
      } catch (e) {
        throw new Error('Invalid password');
      }

      store.password = password;
      store.mnemonic = mnemonic;
      store.locked = false;
      store.wallet = w;

      const currentAccountIndex = 0;
      const addresses = [store.wallet.address];
      const addressesInfo = {
        [store.wallet.address]: { name: `Account ${currentAccountIndex + 1}` },
      };

      await cache('encryptedMnemonic', encryptedMnemonic);
      await cache('currentAccountIndex', currentAccountIndex);
      await cache('addresses', addresses);
      await cache('addressesInfo', addressesInfo);

      setupBalances();

      return {
        locked: store.locked,
        address: store.wallet.address,
        addresses,
        addressesInfo,
      };
    }

    case 'importAccount': {
      const { mnemonic, password } = payload;
      let encryptedMnemonic, w;

      try {
        encryptedMnemonic = await pwd.encrypt(password, mnemonic);

        w = wallet.deriveAddress({
          mnemonics: mnemonic,
          index: currentAccountIndex,
        });
      } catch (e) {
        throw new Error('Invalid password');
      }

      store.password = password;
      store.mnemonic = mnemonic;
      store.locked = false;
      store.wallet = w;

      const currentAccountIndex = 0;
      const addresses = [store.wallet.address];
      const addressesInfo = {
        [store.wallet.address]: { name: `Account ${currentAccountIndex + 1}` },
      };

      await cache('encryptedMnemonic', encryptedMnemonic);
      await cache('currentAccountIndex', currentAccountIndex);
      await cache('addresses', addresses);
      await cache('addressesInfo', addressesInfo);

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
      await cache('encryptedMnemonic', null);
      await cache('currentAccountIndex', null);
      await cache('addresses', []);
      await cache('addressesInfo', {});
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
      const addresses = (await cache('addresses')) || [];
      const addressesInfo = (await cache('addressesInfo')) || {};
      const currentAccountIndex = addresses.length;

      store.wallet = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: currentAccountIndex,
      });
      const { address } = store.wallet;
      addresses.push(address);
      addressesInfo[address] = { name: `Account ${currentAccountIndex + 1}` };

      await cache('currentAccountIndex', currentAccountIndex);
      await cache('addresses', addresses);
      await cache('addressesInfo', addressesInfo);

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

      const addresses = await cache('addresses');

      const currentAccountIndex = addresses.indexOf(address);
      store.wallet = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: currentAccountIndex,
      });
      await cache('currentAccountIndex', currentAccountIndex);

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
        networks: await getNetworks(),
      };
    }

    case 'switchNetwork': {
      const { network } = payload;
      await switchNetwork(network);
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
      const domains = (await cache('domains')) || {};
      domains[origin] = domains[origin] || {};
      domains[origin].accounts = domains[origin].accounts || [];
      // domains[origin].accounts.push(address);
      domains[origin].accounts = [address];
      await cache('domains', domains);
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
      const accounts = await getDomainAccounts(origin);
      return { connected: !!accounts.length };
    }

    case 'getMnemonic': {
      const { mnemonic } = store;
      return { mnemonic };
    }

    case 'sendToken': {
      const {
        wallet: { address },
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
      const result = signAndSendBlock(block);
      const hash = result.hash;
      const txBlockExplorerUrl = await getTxBlockExplorerUrl(hash);
      return { txBlockExplorerUrl, hash };
    }

    case 'confirmTx': {
      const {
        wallet: { address },
      } = store;
      const { type, params } = payload;
      const block = accountBlock.createAccountBlock(type, {
        ...params,
        address,
      });
      const result = signAndSendBlock(block);
      return result;
    }

    case 'getTransactions': {
      const transactions = await getTransactions();
      return { transactions };
    }

    case 'saveAccountName': {
      const addressesInfo = (await cache('addressesInfo')) || {};
      const { address, name } = payload;
      addressesInfo[address] = addressesInfo[address] || {};
      addressesInfo[address].name = name;
      await cache('addressesInfo', addressesInfo);
      return { addressesInfo };
    }

    case 'exportPrivateKey': {
      const { pass, address } = payload;
      if (pass !== store.password) {
        throw new Error('Pass do not match');
      }
      const { mnemonic } = store;
      const addresses = await cache('addresses');
      const accountIndex = addresses.indexOf(address);
      const { privateKey } = wallet.deriveAddress({
        mnemonics: mnemonic,
        index: accountIndex,
      });
      return { exportedPrivateKey: privateKey };
    }

    case 'receiveToken': {
      const {
        wallet: { address },
      } = store;
      const { sendBlockHash } = payload;
      const block = accountBlock.createAccountBlock('receive', {
        address,
        sendBlockHash,
      });
      const result = signAndSendBlock(block);
      const hash = result.hash;
      const txBlockExplorerUrl = await getTxBlockExplorerUrl(hash);
      return { txBlockExplorerUrl, hash };
    }

    case 'addNetwork': {
      const networks = (await cache('networks')) || [];
      for (let i = 0; i < networks.length; i++) {
        const n = networks[i];
        if (n.name === payload.name) {
          throw new Error('A network exists with that name...');
        }
      }
      const id = uuid();
      const network = { id, ...payload };
      await cache('networks', [...networks, network]);
      await switchNetwork(id);
      return {};
    }

    default:
      throw new Error(`unhandled action: ${name}`);
  }
};

async function unlock() {
  const encryptedMnemonic = await cache('encryptedMnemonic');
  const addresses = (await cache('addresses')) || [];
  const currentAccountIndex = await cache('currentAccountIndex');
  const addressesInfo = (await cache('addressesInfo')) || {};
  let mnemonic, w;
  try {
    mnemonic = await pwd.decrypt(store.password, encryptedMnemonic);
    w = wallet.deriveAddress({
      mnemonics: mnemonic,
      index: currentAccountIndex,
    });
  } catch (e) {
    store.password = null;
    throw new Error('Wrong password.');
  }
  store.mnemonic = mnemonic;
  store.wallet = w;
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

// sign and broadcast an account `block`
// fallback to pow option if out of quota
async function signAndSendBlock(block) {
  const {
    wallet: { privateKey },
    client,
  } = store;

  block.setProvider(client).setPrivateKey(privateKey);
  await block.autoSetPreviousAccountBlock();

  // get difficulty
  const { difficulty } = await client.request('ledger_getPoWDifficulty', {
    address: block.address,
    previousHash: block.previousHash,
    blockType: block.blockType,
    toAddress: block.toAddress,
    data: block.data,
  });

  // if difficulty is null,
  // it indicates the account has enough quota to send the transaction
  // there is no need to do PoW
  if (difficulty) {
    const getNonceHashBuffer = Buffer.from(
      block.originalAddress + block.previousHash,
      'hex'
    );
    const getNonceHash = utils.blake2bHex(getNonceHashBuffer, null, 32);
    const nonce = await client.request(
      'util_getPoWNonce',
      difficulty,
      getNonceHash
    );
    block.setDifficulty(difficulty);
    block.setNonce(nonce);
  }

  return await block.sign().send();
}
