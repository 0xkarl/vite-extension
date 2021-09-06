import { cache } from './cache';

export const store = {};

export function getDomainAccounts(domain) {
  if (store.locked) {
    return [];
  }
  const address = store.wallet?.address;
  const domains = cache('domains') || {};
  const { accounts } = domains[domain] || {};
  return accounts && !!~accounts.indexOf(address) ? accounts : [];
}
