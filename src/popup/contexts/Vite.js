import React, { createContext, useContext, useEffect, useState } from 'react';
import { send } from '../utils';

export const ViteContext = createContext(null);

export const ViteProvider = ({ children }) => {
  const [state, _update] = useState({
    error: null,
    locked: true,
    address: null,
    addresses: [],
    addressesInfo: {},
    currentAccountIndex: null,
  });
  const [error, setError] = useState(null);
  const update = (a) => _update((b) => ({ ...b, ...a }));

  useEffect(() => {
    const load = async () => {
      try {
        const state = await send('boot');
        update(state);
      } catch (e) {
        setError(e);
        return;
      }
    };

    load();
  }, []);

  async function unlock(password) {
    try {
      update(await send('unlock', { password }));
    } catch (e) {
      setError(e);
    }
  }

  async function register(password) {
    try {
      update(await send('register', { password }));
    } catch (e) {
      setError(e);
    }
  }

  async function importAccount(mnemonic, password) {
    try {
      update(await send('importAccount', { mnemonic, password }));
    } catch (e) {
      setError(e);
    }
  }

  async function lock() {
    try {
      update(await send('lock'));
    } catch (e) {
      setError(e);
    }
  }

  async function logOut() {
    try {
      update(await send('logOut'));
    } catch (e) {
      setError(e);
    }
  }

  async function createAccount() {
    try {
      update(await send('createAccount'));
    } catch (e) {
      setError(e);
    }
  }

  async function switchAccount(address) {
    try {
      update(await send('switchAccount', { address }));
    } catch (e) {
      setError(e);
    }
  }

  async function saveAccountName(address, name) {
    try {
      update(await send('saveAccountName', { address, name }));
    } catch (e) {
      setError(e);
    }
  }

  async function addNetwork(name, rpcUrl, blockExplorerUrl) {
    try {
      update(await send('addNetwork', { name, rpcUrl, blockExplorerUrl }));
    } catch (e) {
      setError(e);
    }
  }

  return (
    <ViteContext.Provider
      value={{
        ...state,
        error,
        setError,
        unlock,
        register,
        importAccount,
        lock,
        logOut,
        createAccount,
        switchAccount,
        saveAccountName,
        addNetwork,
      }}
    >
      {children}
    </ViteContext.Provider>
  );
};

export function useVite() {
  const context = useContext(ViteContext);
  if (!context) {
    throw new Error('Missing Vite context');
  }
  return context;
}
