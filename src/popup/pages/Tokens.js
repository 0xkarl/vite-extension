import React, { useState, useEffect, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { Link, useHistory } from 'react-router-dom';
import clsx from 'clsx';
import _flatten from 'lodash/flatten';
import _orderBy from 'lodash/orderBy';

import { fmtBig, send, subscribe, BORDER_RADIUS } from '../utils';
import { useVite } from '../contexts/Vite';

const useStyles = makeStyles(() => ({
  container: {
    '& h3': {
      fontSize: 18,
    },

    '& .grid': {
      whiteSpace: 'pre',
    },

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
  const [{ isLoaded, balances, unreceived }, _update] = useState({});
  const update = (a) => _update((b) => ({ ...b, ...a }));

  useEffect(() => {
    const unsubs = [];

    setError(null);

    loadBalances();
    subscribeToBalanceChanges();

    async function loadBalances() {
      update({
        isLoaded: true,
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

  return !isLoaded ? null : (
    <Box className={clsx(classes.container, 'flex flex-col')}>
      <Balances {...{ balances }} />
      {!Object.keys(unreceived).length ? null : (
        <>
          <h4 className="mt-3">UNRECEIVED:</h4>
          <Balances balances={unreceived} receive />
        </>
      )}
    </Box>
  );
}

export default Tokens;

function Balances({ balances, receive }) {
  const classes = useStyles();
  const router = useHistory();
  const { setError } = useVite();

  const doReceive = async (sendBlockHash) => {
    try {
      await send('receiveToken', {
        sendBlockHash,
      });
    } catch (e) {
      setError(e);
    }
  };

  const els = useMemo(
    () =>
      !balances
        ? []
        : _flatten(_orderBy(Object.values(balances), 'usd', 'desc')),
    [balances]
  );

  return (
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
              ${fmtBig(balance.usd, 1, 2)}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button
              key={`${balance.symbol}-button`}
              variant="outlined"
              size="small"
              onClick={() =>
                receive
                  ? doReceive(balance.sendBlockHash)
                  : router.push(
                      `/${receive ? 'receive' : 'send'}/${balance.symbol}`
                    )
              }
            >
              {receive ? 'receive' : 'send'}
            </Button>
          </div>
        </Link>
      ))}
    </div>
  );
}
