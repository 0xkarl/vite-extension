import { store } from './store';
import { unsubscribePort } from './vite';

let PORT;
chrome.runtime.onConnect.addListener(onConnect);

export function onConnect(port) {
  if (PORT) {
    port.disconnect();
    port.onDisconnect.removeListener(onPortDisconnect);
  }
  PORT = port;
  port.onDisconnect.addListener(onPortDisconnect);
}

function onPortDisconnect() {
  PORT = null;
  unsubscribePort();
}

export async function broadcastToTabs(method, params) {
  console.log('broadcast %s %o', method, params);
  const tabs = await new Promise((resolve) => {
    chrome.tabs.query({ active: true }, (tabs) => resolve(tabs));
  });
  tabs.forEach((tab) => {
    chrome.tabs.sendMessage(tab.id, {
      target: 'vite-contentscript',
      data: {
        name: 'metamask-provider',
        data: {
          jsonrpc: '2.0',
          method,
          params,
        },
      },
    });
  });
}

export async function broadcastToPopup(method, params) {
  if (PORT) {
    PORT.postMessage({ name: method, data: params });
  }
}

export async function broadcastAccountChange() {
  broadcastToTabs('metamask_accountsChanged', [store.wallet.address]);
}

export async function broadcastBalancesUpdate() {
  const { totalUSDBalance, balances, unreceived } = store;
  broadcastToPopup('balances', {
    totalUSDBalance,
    balances,
    unreceived,
  });
}

export function getActiveTabId() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true }, ([tab]) => resolve(tab.id));
  });
}
