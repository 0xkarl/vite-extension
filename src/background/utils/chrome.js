import { store } from './store';

const PORTS = new Map([]);

chrome.runtime.onConnect.addListener(onConnect);

export function onConnect(port) {
  port.onDisconnect.addListener(onPortDisconnect);
  PORTS.set(port.name, port);
}

function onPortDisconnect(port) {
  port.onDisconnect.removeListener(onPortDisconnect);
  PORTS.delete(port.name);
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
  for (const port of PORTS.values()) {
    port.postMessage({ name: method, data: params });
  }
}

export async function broadcastAccountChange() {
  broadcastToTabs('metamask_accountsChanged', [store.wallet.address]);
}

export async function broadcastBalancesUpdate() {
  const { totalUSDBalance, balances } = store;
  broadcastToPopup('balances', {
    totalUSDBalance,
    balances,
  });
}

export function getActiveTabId() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true }, ([tab]) => resolve(tab.id));
  });
}
