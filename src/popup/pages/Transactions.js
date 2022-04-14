import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

import { useVite } from '../contexts/Vite';
import { send, subscribe, BORDER_RADIUS } from '../utils';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  container: {},
  txn: {
    borderRadius: BORDER_RADIUS,

    '&:hover': {
      opacity: 0.8,
    },

    '& .date': {
      fontSize: 10,
    },
  },
}));

function Transactions() {
  const classes = useStyles();
  const { address } = useVite();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubs = [];

    loadTransactions();
    subscribeToTransactionChanges();

    async function loadTransactions() {
      const { transactions } = await send('getTransactions');
      setTransactions(transactions);
    }

    function subscribeToTransactionChanges() {
      unsubs.push(subscribe('transactions', setTransactions));
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [address]);

  return (
    <Box className={(classes.container, 'px-4')}>
      <div className="flex flex-col">
        {transactions.map((txn) => (
          <a
            key={txn.hash}
            href={txn.txBlockExplorerUrl}
            className={clsx(
              classes.txn,
              'flex flex-grow justify-between p-2 mb-2 hover:bg-gray-200'
            )}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex flex-col">
              <div className="font-bold">{txn.description}</div>
              <div className="date">
                {txn.date ? <div>{txn.date}</div> : <div className="pending" />}
              </div>
            </div>
            <div className="text-right font-bold">
              {txn.value} {txn.token}
            </div>
          </a>
        ))}
      </div>
    </Box>
  );
}

export default Transactions;
