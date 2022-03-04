import { useState, useEffect, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import _flatten from 'lodash/flatten';
import _orderBy from 'lodash/orderBy';

import { fmtBig, send, subscribe } from '../utils';
import { useVite } from '../contexts/Vite';
import Header from '../components/shared/Header';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {
    '& h3': {
      fontSize: 18,
    },

    '& .grid': {
      display: 'grid',
      gridTemplateColumns: '50px 1fr 1fr 1fr',
      gridRowGap: 10,
      whiteSpace: 'pre',
    },

    '& button': {
      padding: 0,
      width: 50,
      marginLeft: 20,
    },
  },
}));

function Landing() {
  const classes = useStyles();
  const { setError } = useVite();
  const [
    { isLoaded, totalUSDBalance, balances, unreceived },
    _update,
  ] = useState({});
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
      <Header />
      <div>
        {!totalUSDBalance ? null : (
          <Heading>${fmtBig(totalUSDBalance, 1, 2)}</Heading>
        )}
      </div>
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

function Balances({ balances, receive }) {
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

  const els = !balances
    ? []
    : _flatten(
        _orderBy(Object.values(balances), 'usd', 'desc').map((balance) => [
          <img
            key={`${balance.symbol}-thumbnail`}
            src={balance.icon}
            alt={balance.symbol}
            width={25}
            height={25}
          />,
          <div key={`${balance.symbol}-symbol`}>
            {fmtBig(balance.balance, Math.pow(10, balance.decimals))}{' '}
            {balance.symbol.padEnd(6)}
          </div>,
          <div key={`${balance.symbol}-value`}>
            ${fmtBig(balance.usd, 1, 2)}
          </div>,
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
          </Button>,
        ])
      );

  return <div className="grid items-center text-right mt-2">{els}</div>;
}
export default Landing;
