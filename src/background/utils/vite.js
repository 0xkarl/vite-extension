import moment from 'moment';
// import { HTTP_RPC } from '@vite/vitejs-http';
// import { ViteAPI } from '@vite/vitejs';
import './vendor/HTTP.web';
import './vendor/viteAPI.web';

import * as request from './request';
import { store } from './store';
import { toBig, fmtBig } from './bn';
import { cache } from './cache';
import { broadcastBalancesUpdate } from './chrome';
import { shortedAddress } from '../../popup/utils';

const {
  $vite_HTTP: { HTTP_RPC },
  $vite_viteAPI: { ViteAPI },
} = chrome;

const NETWORKS = [
  {
    id: 'mainnet',
    name: 'Mainnet',
    rpcUrl: 'https://node.vite.net/gvite',
    blockExplorerUrl: 'https://viteview.xyz/#/tx/',
  },
  {
    id: 'testnet',
    name: 'Testnet',
    rpcUrl: 'https://buidl.vite.net/gvite',
    blockExplorerUrl: 'https://buidl.viteview.xyz/#/tx/',
  },
  {
    id: 'local',
    name: 'Local',
    rpcUrl: 'http://127.0.0.1:23456',
    blockExplorerUrl: 'http://localhost:9999/#/tx/',
  },
];

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
  store.unreceived = [];

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
  const balanceInfo = await getBalanceInfo();
  // console.log(balanceInfo);
  await Promise.all([
    getBalance(
      'balances',
      Object.values(balanceInfo.balance?.balanceInfoMap ?? {})
    ),
    getBalance('unreceived', balanceInfo.unreceived),
  ]);

  store.totalUSDBalance = Object.values(store.balances).reduce(
    (ret, balance) => ret.plus(balance.usd),
    toBig(0)
  );

  broadcastBalancesUpdate();
}

export async function getBalance(k, balanceInfo) {
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
  store[k] = balances;
  Object.values(store[k]).forEach((balance) => {
    const { icon, price } = infos[balance.symbol];
    balance.usd = balance.balance
      .dividedBy(Math.pow(10, balance.decimals))
      .multipliedBy(price ?? toBig(0));
    balance.icon = icon;
  });
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
    return {
      balance: null,
      unreceived: null,
    };
  }
  if (data[0].error) {
    throw data[0].error;
  }
  if (data[1].error) {
    throw data[1].error;
  }

  return {
    balance: data[0].result,
    unreceived: data[1].result,
  };
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

  const accountBlocks = await store.client.request(
    'ledger_getAccountBlocksByAddress',
    address,
    0,
    100
  );

  console.log({ accountBlocks });

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
        txn.description = `Sent to ${shortedAddress(toAddress)}`;
        txn.value = fmtBig(amount, Math.pow(10, tokenInfo.decimals), 2);
        txn.token = tokenInfo.tokenSymbol;
        ret.push(txn);
        break;
      }

      case 4: {
        txn.description = `Received from ${shortedAddress(fromAddress)}`;
        txn.value = fmtBig(amount, Math.pow(10, tokenInfo.decimals), 2);
        txn.token = tokenInfo.tokenSymbol;
        ret.push(txn);
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
  return blockExplorerUrl + hash;
}
