import qs from 'query-string';
import { store, getDomainAccounts, getActiveTabId } from './utils';

export default async (message, sender) => {
  const { origin } = sender;
  const { id, jsonrpc, method, params = [] } = message.data;
  console.log('cs %s', method);
  switch (method) {
    case 'eth_accounts': {
      return getDomainAccounts(origin);
    }

    case 'eth_requestAccounts': {
      const accounts = getDomainAccounts(origin);
      if (accounts.length) {
        return accounts;
      }
      const tabId = await getActiveTabId();
      await new Promise((resolve) => {
        const host = chrome.runtime.getURL('popup.html');
        const search = qs.stringify({
          tabId,
          id,
          jsonrpc,
          origin,
        });
        const hash = 'connect';
        chrome.windows.create(
          {
            url: `${host}?${search}#${hash}`,
            width: 357 + 20,
            height: 600 + 20,
            type: 'popup',
            left: 0,
          },
          () => resolve()
        );
      });
      return null; // noop
    }

    case 'eth_createAccountBlock': {
      const tx = params;

      const tabId = await getActiveTabId();

      await new Promise((resolve) => {
        const host = chrome.runtime.getURL('popup.html');
        const search = qs.stringify({
          tabId,
          id,
          jsonrpc,
          origin,
          ...tx,
        });

        const hash = 'confirm';
        chrome.windows.create(
          {
            url: `${host}?${search}#${hash}`,
            width: 357 + 20,
            height: 600 + 20,
            type: 'popup',
            left: 0,
          },
          () => resolve()
        );
      });
      return null; // noop
    }

    case 'metamask_getProviderState': {
      return {
        isUnlocked: !store.locked,
        accounts: getDomainAccounts(origin),
        chainId: '0x1',
        networkVersion: 'local',
      };
    }

    case 'metamask_sendDomainMetadata': {
      return true;
    }

    default:
      return await store.provider.send(method, params);
  }
};
