import * as ethers from 'ethers';
import moment from 'moment';
import { HTTP_RPC } from '@vite/vitejs-http';
import { ViteAPI } from '@vite/vitejs';

import { request } from './request';
import { store } from './store';
import { toBig } from './bn';
import { cache } from './cache';
import { broadcastBalancesUpdate } from './chrome';
import ERC20_CONTRACT_ABI from './erc20-abi';

const SYMBOLS = ['VITE'];

const COINGECKO_SYMBOLS = {
  VITE: 'vite',
};

const TOKEN_IMAGES = {
  VITE:
    'https://assets.coingecko.com/coins/images/4513/small/Vite.png?1558014583',
};

const TOKEN_CONTRACT_ADDRESSES = {
  local: {},
  mainnet: {},
};

const LOCAL_CLIENT = new ViteAPI(new HTTP_RPC('http://127.0.0.1:23456'));

const CLIENTS = { local: LOCAL_CLIENT };

let BALANCE_UNSUBS = [];

store.tokens = SYMBOLS.map((symbol) => ({
  symbol,
  decimals: 18,
  image: TOKEN_IMAGES[symbol],
}));

switchNetwork(cache('network') || 'local');

export function switchNetwork(network) {
  store.network = network;
  store.client = CLIENTS[network];
  cache('network', network);
}

export function setupBalances() {
  loadBalances();
  subscribeToBalanceChanges();
}

function loadBalances() {
  unsubscribePort();

  if (!store.wallet) {
    return;
  }

  // const i = setInterval(() => console.log('gg'), 1000);
  // BALANCE_UNSUBS.push(() => clearInterval(i));

  store.totalUSDBalance = toBig(0);

  store.balances = SYMBOLS.reduce((ret, symbol) => {
    ret[symbol] = toBig(0);
    return ret;
  }, {});

  store.usdBalances = SYMBOLS.reduce((ret, symbol) => {
    ret[symbol] = toBig(0);
    return ret;
  }, {});

  store.contracts = SYMBOLS.reduce((ret, symbol) => {
    const tokenContractAddress =
      TOKEN_CONTRACT_ADDRESSES[store.network][symbol];
    if (tokenContractAddress) {
      ret[symbol] = new ethers.Contract(
        tokenContractAddress,
        ERC20_CONTRACT_ABI,
        store.provider
      );
    }
    return ret;
  }, {});

  SYMBOLS.forEach(loadBalance);
}

async function loadBalance(symbol) {
  const { address } = store.wallet;
  let balance;
  if (symbol === 'VITE') {
    const balanceInfo = await store.client.getBalanceInfo(address);
    balance = !balanceInfo.balance.balanceInfoMap
      ? toBig(0)
      : Object.values(balanceInfo.balance.balanceInfoMap).reduce(
          (balance, entry) => balance.plus(toBig(entry.balance)),
          toBig(0)
        );
  } else {
    // const contract = store.contracts[symbol];
    // balance = await contract.balanceOf(address);
  }
  const balances = {};
  balances[symbol] = toBig(balance.toString());
  updateBalances(balances);
}

async function subscribeToBalanceChanges() {
  const {
    client,
    // contracts,
    wallet: { address },
  } = store;
  SYMBOLS.forEach(async (symbol) => {
    if (symbol === 'VITE') {
      const newBlockEvent = 'newAccountBlocks';
      const onBalanceChange = async () => {
        const balanceInfo = await client.getBalanceInfo(address);
        const balance = !balanceInfo.balance.balanceInfoMap
          ? toBig(0)
          : Object.values(balanceInfo.balance.balanceInfoMap).reduce(
              (balance, entry) => balance.plus(toBig(entry.balance)),
              toBig(0)
            );
        updateBalances({ [symbol]: toBig(balance.toString()) });
      };

      const eventName = 'newAccountBlocks';
      const event = await client.subscribe(eventName);
      event.on(onBalanceChange);
      BALANCE_UNSUBS.push(() => event.off(newBlockEvent, onBalanceChange));
    } else {
      // const contract = contracts[symbol];
      // const onBalanceChange = async (from, to) => {
      //   if (from === address || to === address) {
      //     const balance = await contract.balanceOf(address);
      //     updateBalances({ [symbol]: toBig(balance.toString()) });
      //   }
      // };
      // const transferEvent = contract.filters.Transfer();
      // contract.on(transferEvent, onBalanceChange);
      // BALANCE_UNSUBS.push(() => contract.off(transferEvent, onBalanceChange));
    }
  });
}

async function updateBalances(b) {
  const prices = await getPrices();
  store.balances = { ...store.balances, ...b };
  store.usdBalances = Array.from(Object.entries(store.balances)).reduce(
    (ret, [symbol, balance]) => {
      const coingeckoSymbol = COINGECKO_SYMBOLS[symbol];
      const price = toBig(prices[coingeckoSymbol].usd);
      ret[symbol] = balance.dividedBy(1e18).multipliedBy(price);
      return ret;
    },
    {}
  );
  store.totalUSDBalance = Array.from(Object.values(store.usdBalances)).reduce(
    (ret, balance) => ret.plus(balance),
    toBig(0)
  );
  broadcastBalancesUpdate();
}

export function unsubscribePort() {
  BALANCE_UNSUBS.forEach((unsub) => unsub());
  BALANCE_UNSUBS = [];
}

const debounceMemo = (fn) => {
  const C = {};
  const T = {};
  return async () => {
    const key = store.wallet.address;
    let c = C[key];
    const t = T[key];
    const now = Date.now();
    if (!(c && t) || now > t) {
      c = C[key] = await fn();
      T[key] = now + 2 * 60 * 1000;
    }
    return c;
  };
};

export const getPrices = debounceMemo(function () {
  return request('https://api.coingecko.com/api/v3/simple/price', {
    ids: SYMBOLS.map((symbol) => COINGECKO_SYMBOLS[symbol]).join(','),
    vs_currencies: 'usd',
  });
});

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
