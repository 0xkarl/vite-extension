import qs from 'query-string';
import {
  store,
  getDomainAccounts,
  getActiveTabId,
  getCurrentNetwork,
} from './utils';

export default async (message, sender) => {
  const { origin } = sender;
  const { id, jsonrpc, method, params = [] } = message.data;
  console.log('cs %s', method);
  switch (method) {
    case 'vite_accounts': {
      return await getDomainAccounts(origin);
    }

    case 'vite_requestAccounts': {
      const accounts = await getDomainAccounts(origin);
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

    case 'vite_chainId': {
      const { chainId } = getCurrentNetwork();
      return chainId;
    }

    case 'vite_networkVersion': {
      const { networkVersion } = getCurrentNetwork();
      return networkVersion;
    }

    case 'vite_createAccountBlock': {
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
      const { chainId, networkVersion } = getCurrentNetwork();
      return {
        isUnlocked: !store.locked,
        accounts: await getDomainAccounts(origin),
        chainId,
        networkVersion,
      };
    }

    case 'metamask_sendDomainMetadata': {
      return true;
    }

    default:
      return await store.provider.send(method, params);
  }
};
