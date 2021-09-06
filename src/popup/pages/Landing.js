import { useState, useEffect, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';
import _flatten from 'lodash/flatten';

import { fmtBig, send, subscribe } from '../utils';
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
  const router = useHistory();
  const classes = useStyles();
  const [
    { isLoaded, totalUSDBalance, tokens, balances, usdBalances },
    _update,
  ] = useState({});

  const update = (a) => _update((b) => ({ ...b, ...a }));

  useEffect(() => {
    const unsubs = [];

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

  const tokensEls = !(tokens && usdBalances && balances)
    ? []
    : _flatten(
        tokens.map((token) => [
          <img
            key={`${token.symbol}-thumbnail`}
            src={token.image}
            alt={token.symbol}
            width={25}
            height={25}
          />,
          <div key={`${token.symbol}-symbol`}>
            {fmtBig(balances[token.symbol], Math.pow(10, token.decimals))}{' '}
            {token.symbol.padEnd(6)}
          </div>,
          <div key={`${token.symbol}-value`}>
            ${fmtBig(usdBalances[token.symbol], 1, 2)}
          </div>,
          <Button
            key={`${token.symbol}-button`}
            variant="outlined"
            size="small"
            onClick={() => router.push(`/send/${token.symbol}`)}
          >
            send
          </Button>,
        ])
      );

  return !isLoaded ? null : (
    <Box className={clsx(classes.container, 'flex flex-col')}>
      <Header />
      <div>
        {!totalUSDBalance ? null : (
          <Heading>${fmtBig(totalUSDBalance, 1, 2)}</Heading>
        )}
      </div>
      <div className="grid items-center text-right mt-2">{tokensEls}</div>
    </Box>
  );
}

export default Landing;
