import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';

import { send, subscribe, BORDER_RADIUS } from '../../utils';
import Loader from './Loader';

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

const Transactions = ({ token }) => {
  const classes = useStyles();

  const [transactions, setTransactions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubs = [];

    loadTransactions();
    subscribeToTransactionChanges();

    async function loadTransactions() {
      const { transactions } = await send('getTransactions', { token });
      setTransactions(transactions);
      setIsLoaded(true);
    }

    function subscribeToTransactionChanges() {
      unsubs.push(subscribe('transactions', setTransactions));
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  return !isLoaded ? (
    <div className="flex justify-center mt-4">
      <Loader text="Loading" />
    </div>
  ) : !transactions?.length ? (
    <div className="flex justify-center mt-4">No transactions found.</div>
  ) : (
    <>
      <div className="flex flex-col">
        {transactions.map((txn) => (
          <a
            key={txn.hash}
            href={txn.txBlockExplorerUrl}
            className={clsx(
              classes.txn,
              'flex flex-grow justify-between p-2 mb-2 hover:opacity-80'
            )}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex flex-col">
              <div className="font-bold">{txn.action}</div>
              <div className="font-bold">{txn.address}</div>
              <div className="date">
                {txn.date ? <div>{txn.date}</div> : <div className="pending" />}
              </div>
            </div>
            <div className="text-right font-bold">
              <div>{txn.value}</div>
              <div>{txn.token}</div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
};

export default Transactions;
