import { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

import { useVite } from '../contexts/Vite';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles((theme) => ({
  container: {
    '& .txn': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      borderTop: '1px solid #eee',
    },

    '& .txn:hover': {
      opacity: 0.8,
    },

    '& .pending': {
      color: ',orange',
    },

    '& .pending:after': {
      content: 'Pending',
    },
  },
}));

function Transactions() {
  const classes = useStyles();
  const { address } = useVite();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { transactions } = await send('getTransactions');
      setTransactions(transactions);
    };
    load();
  }, [address]);

  return (
    <Box className={classes.container}>
      <Heading>
        Transactions <a href="#/">✕</a>
      </Heading>

      <div className="flex flex-col">
        {transactions.map((txn) => (
          <a
            key={txn.txBlockExplorerUrl}
            href={txn.txBlockExplorerUrl}
            className="txn py-2"
            target="_blank"
          >
            <div className="text-lg">{txn.description}</div>
            <div className="text-right text-base">
              {txn.value}
              {txn.token}
            </div>
            <div>
              {txn.date ? <div>{txn.date}</div> : <div className="pending" />}
            </div>
          </a>
        ))}
      </div>
    </Box>
  );
}

export default Transactions;
