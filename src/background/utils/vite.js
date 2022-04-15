import moment from 'moment';
import { accountBlock, utils } from '@vite/vitejs';
import './vendor/HTTP.web';
import './vendor/viteAPI.web';

import * as request from './request';
import { store } from './store';
import { toBig, fmtBig } from './bn';
import { cache } from './cache';
import { broadcastBalancesUpdate } from './chrome';
import { abbrAddress, sleep } from './misc';

const {
  $vite_HTTP: { HTTP_RPC },
  $vite_viteAPI: { ViteAPI },
} = chrome;

const NETWORKS = [
  {
    id: 'mainnet',
    name: 'Mainnet',
    rpcUrl: 'https://node.vite.net/gvite',
    blockExplorerUrl: 'https://viteview.xyz/#',
  },
  {
    id: 'testnet',
    name: 'Testnet',
    rpcUrl: 'https://buidl.vite.net/gvite',
    blockExplorerUrl: 'https://buidl.viteview.xyz/#',
  },
  {
    id: 'local',
    name: 'Local',
    rpcUrl: 'http://127.0.0.1:23456',
    blockExplorerUrl: 'http://localhost:9999/#',
  },
];

const DEFAULT_TOKENS = {
  tti_5649544520544f4b454e6e40: {
    tokenInfo: {
      tokenName: 'VITE',
      tokenSymbol: 'VITE',
      decimals: 18,
      tokenId: 'tti_5649544520544f4b454e6e40',
    },
    balance: '0',
  },
  tti_564954455820434f494e69b5: {
    tokenInfo: {
      tokenName: 'ViteX Coin',
      tokenSymbol: 'VX',
      decimals: 18,
      tokenId: 'tti_564954455820434f494e69b5',
    },
    balance: '0',
  },
};

export const NULL_ADDRESS = '0'.repeat(64);

let BALANCE_UNSUBS = [];

main();

async function main() {
  await switchNetwork((await cache('network')) || 'mainnet');
}

export async function switchNetwork(networkId) {
  const { rpcUrl } = await getNetwork(networkId);
  store.network = networkId;
  store.client = new ViteAPI(new HTTP_RPC(rpcUrl));
  await cache('network', networkId);
}

export async function getNetworks() {
  return NETWORKS.concat((await cache('networks')) || []);
}

export async function getNetwork(networkId) {
  const networks = await getNetworks();
  for (let i = 0; i < networks.length; i++) {
    const n = networks[i];
    if (n.id === networkId) {
      return n;
    }
  }
}

export function setupBalances() {
  loadBalances();
  subscribeToBalanceChanges();
}

async function loadBalances() {
  unsubscribePort();

  if (!store.wallet) {
    return;
  }

  store.totalUSDBalance = toBig(0);
  store.balances = [];

  updateBalances();
}

async function subscribeToBalanceChanges() {
  const { client } = store;

  const newBlockEvent = 'newAccountBlocks';
  const onBalanceChange = async () => {
    updateBalances();
  };

  const eventName = 'newAccountBlocks';
  const event = await client.subscribe(eventName);
  event.on(onBalanceChange);
  BALANCE_UNSUBS.push(() => event.off(newBlockEvent, onBalanceChange));
}

async function updateBalances() {
  const balance = await getBalanceInfo();

  const received = balance?.balanceInfoMap ?? {};
  Object.entries(DEFAULT_TOKENS).forEach(([defaultTokenId, defaultToken]) => {
    if (!received[defaultTokenId]) {
      received[defaultTokenId] = defaultToken;
    }
  });

  await getBalance(Object.values(received));

  store.totalUSDBalance = Object.values(store.balances).reduce(
    (ret, balance) => ret.plus(balance.usd),
    toBig(0)
  );

  broadcastBalancesUpdate();
}

export async function getBalance(balanceInfo) {
  const balances = balanceInfo.reduce((ret, entry) => {
    ret[entry.tokenInfo.tokenSymbol] = {
      balance: toBig(entry.balance ?? entry.amount),
      fromAddress: entry.accountAddress,
      decimals: entry.tokenInfo.decimals,
      name: entry.tokenInfo.tokenName,
      symbol: entry.tokenInfo.tokenSymbol,
      tokenId: entry.tokenInfo.tokenId,
      sendBlockHash: entry.hash,
    };
    return ret;
  }, {});

  const infos = await getTokenInfo(
    Object.values(balances).map((entry) => entry.tokenId)
  );

  Object.values(balances).forEach((balance) => {
    let { icon, price } = infos[balance.symbol] ?? { icon: null };
    if (icon === null) {
      icon =
        'https://static.vite.net/token-profile-1257137467/icon/c746e8a95dff8ce193c462554feb61bf.png';
      if (balance.symbol === 'USDV') {
        price = toBig(1);
      }
    }
    balance.usd = balance.balance
      .dividedBy(Math.pow(10, balance.decimals))
      .multipliedBy(price ?? toBig(0));
    balance.icon = icon;
  });

  store.balances = balances;
}

async function getBalanceInfo() {
  const { address } = store.wallet;

  const data = await store.client.batch([
    {
      methodName: 'ledger_getAccountInfoByAddress',
      params: [address],
    },
    {
      methodName: 'ledger_getUnreceivedBlocksByAddress',
      params: [address, 0, 100],
    },
  ]);

  if (!data || (data instanceof Array && data.length < 2)) {
    return null;
  }
  if (data[0].error) {
    throw data[0].error;
  }
  if (data[1].error) {
    throw data[1].error;
  }

  if (data[1].result.length) {
    for (let i = 0; i < data[1].result.length; i++) {
      const { hash: sendBlockHash } = data[1].result[i];
      const block = accountBlock.createAccountBlock('receive', {
        address,
        sendBlockHash,
      });
      try {
        await signAndSendBlock(block);
      } catch (e) {
        console.warn(e);
      }
    }

    await sleep(1000);
    return await getBalanceInfo();
  }

  return data[0].result;
}

export function unsubscribePort() {
  BALANCE_UNSUBS.forEach((unsub) => unsub());
  BALANCE_UNSUBS = [];
}

export const getTokenInfo = async function (tokenAddresses) {
  const tickers24h = await request.get(
    'https://vitex.vite.net/api/v2/ticker/24hr?quoteTokenCategory=USDT'
  );

  const prices = Object.values(tickers24h.data).reduce((ret, entry) => {
    ret[entry.tradeToken] = toBig(entry.closePrice);
    return ret;
  }, {});

  const { data } = await request.post(
    'https://vitex.vite.net/api/v1/cryptocurrency/info/platform/query',
    {
      platformSymbol: 'VITE',
      tokenAddresses,
    }
  );

  return Object.values(data).reduce((ret, entry) => {
    ret[entry.symbol] = {
      price: entry.symbol === 'USDT' ? toBig(1) : prices[entry.tokenAddress],
      icon: entry.icon,
    };
    return ret;
  }, {});
};

export const getTransactions = async function (token) {
  const {
    wallet: { address },
  } = store;

  const accountBlocks = await store.client.request(
    'ledger_getAccountBlocksByAddress',
    address,
    0,
    100
  );

  if (!accountBlocks) {
    return [];
  }

  const ret = [];

  for (let j = 0; j < accountBlocks.length; j++) {
    const {
      blockType,
      fromAddress,
      toAddress,
      amount,
      hash,
      tokenInfo,
      timestamp,
    } = accountBlocks[j];

    const txn = { hash };
    txn.txBlockExplorerUrl = await getTxBlockExplorerUrl(hash);
    txn.date = moment.unix(timestamp).local().format('MMM D, HH:mm');

    switch (blockType) {
      // 1->request(create contract).
      // 2->request(transfer).
      // 3->request(re-issue token).
      // 4->response.
      // 5->response(failed).
      // 6->request(refund by contract).
      // 7->response(genesis).

      case 2: {
        txn.description = `Sent to ${abbrAddress(toAddress)}`;
        txn.value = fmtBig(amount, Math.pow(10, tokenInfo.decimals), 2);
        txn.token = tokenInfo.tokenSymbol;
        if (!token || txn.token === token) {
          ret.push(txn);
        }
        break;
      }

      case 4: {
        txn.description = `Received from ${abbrAddress(fromAddress)}`;
        txn.value = fmtBig(amount, Math.pow(10, tokenInfo.decimals), 2);
        txn.token = tokenInfo.tokenSymbol;
        if (!token || txn.token === token) {
          ret.push(txn);
        }
        break;
      }

      default:
    }
  }

  return ret.filter((txn) => !!txn);
};

export async function getTxBlockExplorerUrl(hash, networkId) {
  networkId = networkId || store.network;
  const { blockExplorerUrl } = await getNetwork(networkId);
  return blockExplorerUrl + '/tx/' + hash;
}

// sign and broadcast an account `block`
// fallback to pow option if out of quota
export async function signAndSendBlock(block) {
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
