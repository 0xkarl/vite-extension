import qs from 'query-string';

export function getQueryParams() {
  return qs.parse(window.location.search.replace(/^\?/, ''));
}

export function shortedAddress(address) {
  return `${address.slice(0, 9)}....${address.slice(-4)}`;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
