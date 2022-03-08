import { cache } from './cache';

export const store = {};

export async function getDomainAccounts(domain) {
  if (store.locked) {
    return [];
  }
  const address = store.wallet?.address;
  const domains = (await cache('domains')) || {};
  const { accounts } = domains[domain] || {};
  return accounts && !!~accounts.indexOf(address) ? accounts : [];
}
