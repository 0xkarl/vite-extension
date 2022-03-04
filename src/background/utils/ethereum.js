import { store } from './store';

export function getCurrentNetwork() {
  const network = store.network;
  return {
    chainId:
      network === 'mainnet' ? '0x1' : network === 'testnet' ? '0x2' : '0x3',
    networkVersion: network, // todo
  };
}
