import React, { useState, useEffect, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import _flatten from 'lodash/flatten';
import _orderBy from 'lodash/orderBy';

import { fmtBig, send, subscribe, BORDER_RADIUS } from '../utils';
import { useVite } from '../contexts/Vite';
import Loader from '../components/shared/Loader';

const useStyles = makeStyles(() => ({
  container: {
    '& button': {
      padding: 0,
      width: 50,
      alignSelf: 'right',
    },
  },
  assetName: {
    fontSize: 18,
  },
  assetValue: {
    fontSize: 12,
  },
  tokenRow: {
    borderRadius: BORDER_RADIUS,
  },
}));

function Tokens() {
  const classes = useStyles();
  const { setError } = useVite();
  const [{ balances }, _update] = useState({});
  const update = (a) => _update((b) => ({ ...b, ...a }));

  useEffect(() => {
    const unsubs = [];

    setError(null);

    loadBalances();
    subscribeToBalanceChanges();

    async function loadBalances() {
      update({
        ...(await send('getBalances')),
      });
    }

    function subscribeToBalanceChanges() {
      unsubs.push(subscribe('balances', (balances) => update(balances)));
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  const els = useMemo(
    () =>
      !balances
        ? []
        : _flatten(_orderBy(Object.values(balances), 'usd', 'desc')),
    [balances]
  );

  return !els.length ? (
    <div className="flex justify-center mt-4">
      <Loader text="Loading" />
    </div>
  ) : (
    <Box className={clsx(classes.container, 'flex flex-col')}>
      <div className="mt-2">
        {els.map((balance) => (
          <Link
            to={`/token/${balance.symbol}`}
            key={balance.symbol}
            className={clsx(
              classes.tokenRow,
              'flex items-center p-2 mb-2 hover:bg-gray-200'
            )}
          >
            <img
              src={balance.icon}
              alt={balance.symbol}
              width={25}
              height={25}
              className="mr-4"
            />
            <div key={`${balance.symbol}-symbol`} className="flex-grow">
              <div className={clsx(classes.assetName, 'font-bold')}>
                <span className="mr-1">
                  {fmtBig(balance.balance, Math.pow(10, balance.decimals))}
                </span>
                {balance.symbol.padEnd(6)}
              </div>
              <div className={clsx(classes.assetValue, 'text-gray-500')}>
                ${fmtBig(balance.usd ?? 0, 1, 2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Box>
  );
}

export default Tokens;
