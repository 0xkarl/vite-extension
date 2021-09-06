import { BigNumber } from 'bignumber.js';

const PRECISION = 4;

export function toBig(n) {
  return new BigNumber(n.toString());
}

export function fmtBig(a, b, precision = PRECISION) {
  a = toBig(a);
  b = toBig(b);
  if (a.isZero() || b.isZero()) {
    return '0';
  }
  return a.div(b).toFormat(precision);
}
