export function abbrAddress(address) {
  return `${address.slice(0, 9)}....${address.slice(-4)}`;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
