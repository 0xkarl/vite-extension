import React, { useState, useEffect, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import { Switch, Route, Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencil as editIcon,
  faCopy as copyIcon,
  faCheck as copiedIcon,
  faArrowUpRightFromSquare as shareIcon,
  faCreditCard as depositIcon,
  faPaperPlane as sendIcon,
} from '@fortawesome/free-solid-svg-icons';

import {
  BORDER_RADIUS,
  fmtBig,
  send,
  subscribe,
  abbrAddress,
  sleep,
} from '../utils';
import { useVite } from '../contexts/Vite';
import Header from '../components/shared/Header';
import Tokens from './Tokens';
import Transactions from './Transactions';

const useStyles = makeStyles(() => ({
  container: {},
  blueBox: {
    boxShadow: 'rgb(197 206 224) 0px 12px 20px -4px',
    backgroundImage: 'linear-gradient(256.28deg, #1c94f4 0%, #1273ea 100%)',
    borderRadius: BORDER_RADIUS,
  },
  content: {
    height: 320,
    overflowY: 'auto',
  },
  totalUSDBalance: {
    fontSize: 30,
  },
  action: {
    fontSize: 24,
    borderRadius: BORDER_RADIUS,
  },
  tabs: {
    '& .active': {
      color: '#006fe9',
      fontWeight: 'bold',
    },
  },
}));

function Landing() {
  const classes = useStyles();
  const { address, addressesInfo, setError } = useVite();
  const [
    { copied, isLoaded, totalUSDBalance, networks, network },
    _update,
  ] = useState({
    networks: [],
  });
  const update = (a) => _update((b) => ({ ...b, ...a }));

  const networkConfig = useMemo(() => {
    for (let i = 0; i < networks.length; i++) {
      const n = networks[i];
      if (n.id === network) {
        return n;
      }
    }
  }, [networks, network]);

  useEffect(() => {
    const unsubs = [];

    setError(null);

    loadBalances();
    subscribeToBalanceChanges();

    async function loadBalances() {
      update({
        isLoaded: true,
        ...(await send('getBalances')),
        ...(await send('getNetwork')),
      });
    }

    function subscribeToBalanceChanges() {
      unsubs.push(subscribe('balances', (balances) => update(balances)));
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  async function copy() {
    navigator.clipboard.writeText(address);
    update({ copied: true });
    await sleep(1000);
    update({ copied: false });
  }

  return !isLoaded ? null : (
    <Box className={clsx(classes.container, 'flex flex-col')}>
      <Header />

      <div
        className={clsx(
          classes.blueBox,
          'flex flex-col justify-center p-4 my-2 text-white'
        )}
      >
        <div className="flex items-center">
          <div className="flex flex-grow items-center">
            {addressesInfo[address].name} ({abbrAddress(address)})
            <Link className="cursor-pointer ml-2" to={`/account/${address}`}>
              <FontAwesomeIcon icon={editIcon} />
            </Link>
          </div>
          <Tooltip title="Copy" arrow>
            <div
              className="cursor-pointer w-7 flex items-center"
              onClick={copy}
            >
              {copied ? (
                <FontAwesomeIcon
                  icon={copiedIcon}
                  className="flex items-center"
                />
              ) : (
                <FontAwesomeIcon
                  icon={copyIcon}
                  className="flex items-center"
                />
              )}
            </div>
          </Tooltip>
          <a
            href={`${
              !networkConfig ? '' : networkConfig.blockExplorerUrl
            }/address/${address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center"
          >
            <FontAwesomeIcon icon={shareIcon} />
          </a>
        </div>

        {!totalUSDBalance ? null : (
          <div className={clsx(classes.totalUSDBalance, 'font-extrabold')}>
            ${fmtBig(totalUSDBalance, 1, 2)}
          </div>
        )}
      </div>

      <div
        className={clsx('grid grid-cols-2 justify-center my-2 text-primary')}
      >
        <div className="text-right mr-3">
          <Link
            to="/deposit"
            className={clsx(classes.action, 'bg-gray-100 p-2')}
          >
            <FontAwesomeIcon icon={depositIcon} />
          </Link>
        </div>
        <div className="ml-3">
          <Link to="/send" className={clsx(classes.action, 'bg-gray-100 p-2')}>
            <FontAwesomeIcon icon={sendIcon} />
          </Link>
        </div>
      </div>

      <Box
        className={clsx('grid grid-cols-2 justify-center my-2', classes.tabs)}
      >
        <NavLink
          to={'/landing'}
          className="border-basic-4 text-basic-5 py-1 border-r text-right pr-1"
          exact
        >
          Assets
        </NavLink>
        <NavLink
          to={'/landing/transactions'}
          className="border-basic-4 text-basic-5 py-1 pl-1"
          exact
        >
          Activities
        </NavLink>
      </Box>

      <Box className={classes.content}>
        <Switch>
          <Route exact path="/landing/transactions" component={Transactions} />
          <Route exact path="/landing" component={Tokens} />
        </Switch>
      </Box>
    </Box>
  );
}

export default Landing;
