import React, { useEffect, useState, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import _flatten from 'lodash/flatten';
import _orderBy from 'lodash/orderBy';

import { useVite } from '../contexts/Vite';
import { send, abbrAddress, subscribe } from '../utils';
import Heading from '../components/shared/Heading';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(() => ({
  container: {},
  tick: {
    border: '2px solid #eee',
    borderRadius: '50%',
    width: 70,
    height: 70,
  },
}));

function Send() {
  const classes = useStyles();
  const router = useHistory();
  const { setError } = useVite();
  const [token, setToken] = useState('VITE');

  const [state, _update] = useState({});
  const update = (a) => _update((b) => ({ ...b, ...a }));

  const balances = useMemo(
    () =>
      !state.balances
        ? []
        : _flatten(_orderBy(Object.values(state.balances), 'usd', 'desc')),
    [state]
  );

  useEffect(() => {
    const unsubs = [];

    setError(null);

    loadBalances();
    subscribeToBalanceChanges();

    async function loadBalances() {
      update({
        working: false,
        amount: null,
        recipient: '',
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

  async function onSend(e) {
    e.preventDefault();

    const { amount } = state;
    const recipient = e.target.recipient.value;

    setError(null);
    update({ working: true });

    try {
      const { balances } = await send('getBalances');
      const { decimals, tokenId } = balances[token];
      const { txBlockExplorerUrl } = await send('sendToken', {
        token,
        amount,
        recipient,
        decimals,
        tokenId,
      });
      update({ txBlockExplorerUrl, recipient });
      update({ sent: true });
    } catch (e) {
      setError(e);
    } finally {
      update({ working: false });
    }
  }

  function onSetAmount(e) {
    update({ amount: e.target.value });
  }

  async function onSetMaxAmount() {
    const { balances } = await send('getBalances');
    const { balance, decimals } = balances[token];
    update({
      amount: new BigNumber(balance).div(Math.pow(10, decimals)).toString(),
    });
  }

  function onGoBack() {
    router.push('/');
  }

  return (
    <Box className={classes.container}>
      {!state.sent ? (
        <form onSubmit={onSend}>
          <Heading>Send ({token})</Heading>

          <Box mt={2} className="flex items-end">
            <FormControl fullWidth>
              <InputLabel id="tokenLabel">Asset</InputLabel>
              <Select
                name="token"
                labelId="tokenLabel"
                id="tokenSelect"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              >
                {balances.map((balance) => (
                  <MenuItem value={balance.symbol} key={balance.symbol}>
                    {balance.symbol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box mt={2} className="flex items-end">
            <TextField
              id="amount"
              label="Amount"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              step="any"
              placeholder="Type amount..."
              fullWidth
              required
              value={state.amount}
              onChange={onSetAmount}
            />
            <Box ml={1}>
              <Button
                variant="outlined"
                size="small"
                type="button"
                onClick={onSetMaxAmount}
              >
                MAX
              </Button>
            </Box>
          </Box>

          <Box mt={2}>
            <TextField
              id="recipient"
              label="Recipient"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Type address..."
              fullWidth
              required
              autoComplete="off"
            />
          </Box>

          <div className="flex mt-3">
            <Box>
              <Button
                variant="outlined"
                size="small"
                type="submit"
                disabled={state.working}
              >
                Next
              </Button>
            </Box>

            <Box ml={1}>
              <Button
                variant="outlined"
                size="small"
                type="button"
                onClick={onGoBack}
                disabled={state.working}
              >
                Cancel
              </Button>
            </Box>

            {!state.txBlockExplorerUrl ? null : (
              <div className="mt-3">
                Track on{' '}
                <a
                  href={state.txBlockExplorerUrl}
                  target="_blank"
                  className="text-bold"
                  rel="noreferrer"
                >
                  block explorer
                </a>
                ...
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center">
          <div
            className={clsx(
              classes.tick,
              'text-5xl flex items-center justify-center'
            )}
          >
            ✓
          </div>
          <div className="mt-2">
            <div className="text-center">
              Sent {state.amount}
              {token} to {abbrAddress(state.recipient)}
            </div>
            <div className="text-center">
              View on&nbsp;
              <a
                href={state.txBlockExplorerUrl}
                target="_blank"
                className="text-bold"
                rel="noreferrer"
              >
                block explorer
              </a>
            </div>
          </div>
          <Box mt={2}>
            <Button
              variant="outlined"
              size="small"
              type="button"
              onClick={onGoBack}
            >
              Finish
            </Button>
          </Box>
        </div>
      )}
    </Box>
  );
}

export default Send;
