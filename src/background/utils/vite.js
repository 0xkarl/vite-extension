import moment from 'moment';
import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';

import * as request from './request';
import { store } from './store';
import { toBig } from './bn';
import { cache } from './cache';
import { broadcastBalancesUpdate } from './chrome';

const LOCAL_CLIENT = new ViteAPI(new HTTP_RPC('http://127.0.0.1:23456'));
const MAINNET_CLIENT = new ViteAPI(new HTTP_RPC('https://node.vite.net/gvite'));
const TESTNET_CLIENT = new ViteAPI(
  new HTTP_RPC('https://buidl.vite.net/gvite')
);

export const CLIENTS = {
  local: LOCAL_CLIENT,
  mainnet: MAINNET_CLIENT,
  testnet: TESTNET_CLIENT,
};

let BALANCE_UNSUBS = [];

switchNetwork(cache('network') || 'mainnet');

export function switchNetwork(network) {
  store.network = network;
  store.client = CLIENTS[network];
  cache('network', network);
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
  const { address } = store.wallet;

  const balanceInfo = await store.client.getBalanceInfo(address);
  const balanceInfoMap = balanceInfo?.balance?.balanceInfoMap ?? {};
  const balances = Object.values(balanceInfoMap).reduce((ret, entry) => {
    ret[entry.tokenInfo.tokenSymbol] = {
      balance: toBig(entry.balance),
      decimals: entry.tokenInfo.decimals,
      name: entry.tokenInfo.tokenName,
      symbol: entry.tokenInfo.tokenSymbol,
      tokenId: entry.tokenInfo.tokenId,
    };
    return ret;
  }, {});

  const infos = await getTokenInfo(
    Object.values(balances).map((entry) => entry.tokenId)
  );
  store.balances = { ...store.balances, ...balances };
  Object.values(store.balances).forEach((balance) => {
    const { icon, price } = infos[balance.symbol];
    balance.usd = balance.balance
      .dividedBy(Math.pow(10, balance.decimals))
      .multipliedBy(price ?? toBig(0));
    balance.icon = icon;
  });
  store.totalUSDBalance = Object.values(store.balances).reduce(
    (ret, balance) => ret.plus(balance.usd),
    toBig(0)
  );

  broadcastBalancesUpdate();
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

export const getTransactions = async function () {
  const {
    wallet: { address },
  } = store;
  const allTxns = cache('transactions') || {};
  let txns = [];
  for (const nonce in allTxns[address]) {
    txns.push({
      nonce,
      ...allTxns[address][nonce],
    });
  }
  txns = await Promise.all(txns.map(checkIfTxnIsComplete));
  txns.sort((a, b) => {
    a = parseInt(a.nonce);
    b = parseInt(b.nonce);
    if (a < b) {
      return -1;
    }
    if (b < a) {
      return 1;
    }
    return 0;
  });
  return txns.map(({ hash, network, ...rest }) => ({
    hash,
    txBlockExplorerUrl: getTxBlockExplorerUrl(hash, network),
    ...rest,
  }));
};

async function checkIfTxnIsComplete(txn) {
  if (!txn.timestamp) {
    const receipt = await store.provider.getTransactionReceipt(txn.hash);
    if (receipt) {
      const block = await store.provider.getBlock(receipt.blockNumber);
      txn.timestamp = block.timestamp;

      const allTxns = cache('transactions');
      allTxns[store.wallet.address][txn.nonce] = txn;
      cache('transactions', allTxns);
    }
  }
  txn.date = moment.unix(txn.timestamp).local().format('MMM D');
  return txn;
}

export function cachePendingTxn(address, nonce, txn) {
  const { network } = store;
  const allTxns = cache('transactions') || {};
  const txns = allTxns[address] || {};
  txns[nonce] = {
    ...txn,
    network,
  };
  allTxns[address] = txns;
  cache('transactions', allTxns);
}

export function cacheCompletedTxn(hash) {
  const {
    wallet: { address },
  } = store;
  const allTxns = cache('transactions') || {};
  const txns = allTxns[address] || {};
  for (const nonce in txns) {
    const txn = txns[nonce];
    if (txn.hash === hash) {
      txn.timestamp = moment.utc().unix();
      allTxns[address] = txns;
      cache('transactions', allTxns);
      break;
    }
  }
}

export function getTxBlockExplorerUrl(hash, network) {
  network = network || store.network;
  // const subdomain = network === 'mainnet' ? '' : `${network}.`;
  return `https://explorer.vite.net/transaction/${hash}`;
}

export function getCurrentNetwork() {
  const network = store.network;
  return {
    chainId:
      network === 'mainnet' ? '0x1' : network === 'testnet' ? '0x2' : '0x3',
    networkVersion: network, // todo
  };
}
