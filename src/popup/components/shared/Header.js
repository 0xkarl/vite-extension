import { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';

import { send, sleep, shortedAddress } from '../../utils';
import { useVite } from '../../contexts/Vite';

const useStyles = makeStyles(() => ({
  container: {},

  active: {
    color: 'deepskyblue',
  },

  sep: {
    width: '100%',
    height: 1,
    background: '#eee',
    margin: '5px 0',
  },

  accounts: {
    maxHeight: 100,
    overflowY: 'auto',
  },
}));

function Header() {
  const classes = useStyles();
  const router = useHistory();
  const {
    address,
    addresses,
    addressesInfo,
    createAccount,
    logOut,
    lock,
    switchAccount,
  } = useVite();

  const [{ copied, network, networks, searchedAddresses }, _update] = useState({
    searchedAddresses: [],
    networks: [],
  });

  const update = (a) => _update((b) => ({ ...b, ...a }));

  const [anchorEl, setAnchorEl] = useState(null);

  const showMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const hideMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        update({
          ...(await send('getNetwork')),
          searchedAddresses: addresses,
        });
      } catch (e) {}
    };
    load();
  }, [addresses]);

  async function switchNetwork(network) {
    update(await send('switchNetwork', { network }));
  }

  async function copy() {
    navigator.clipboard.writeText(address);
    update({ copied: true });
    await sleep(1000);
    update({ copied: false });
  }

  function goToSettings() {
    hideMenu();
    router.push('/settings');
  }

  function goToTransactions() {
    hideMenu();
    router.push('/transactions');
  }

  function onSearch(e) {
    const queryTerm = new RegExp((e.target.value || '').trim(), 'gi');
    update({
      searchedAddresses: !queryTerm
        ? addresses
        : addresses.filter((a) => !!~addressesInfo[a].name.search(queryTerm)),
    });
  }

  function startAddNetwork() {
    hideMenu();
    router.push('/add-network');
  }

  return (
    <Box className={classes.container}>
      <div className="menu flex flex-col flex-grow mb-2">
        <div className="flex flex-grow">
          <div className="flex flex-grow">
            <div>
              <Tooltip title="Copy" arrow>
                <div className="cursor-pointer" onClick={copy}>
                  {addressesInfo[address].name} ({shortedAddress(address)})
                  {copied ? '✓' : null}
                </div>
              </Tooltip>
            </div>
            <div className="mx-1">/</div>
            <div
              className="cursor-pointer underline"
              onClick={() => router.push(`/account/${address}`)}
            >
              edit
            </div>
          </div>
          <SettingsIcon className="cursor-pointer" onClick={showMenu} />
        </div>

        <Menu
          id="header-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={hideMenu}
        >
          <Box px={2}>
            <TextField
              name="search"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Search accounts..."
              fullWidth
              onInput={onSearch}
              size="small"
            />

            <Box className={classes.accounts} mt={1}>
              {searchedAddresses.map((addr) => (
                <div
                  key={addr}
                  className={clsx('cursor-pointer', {
                    [classes.active]: addr === address,
                  })}
                  onClick={() => switchAccount(addr)}
                >
                  {addressesInfo[addr].name} {addr !== address ? null : '✓'}
                </div>
              ))}

              {searchedAddresses.length ? null : (
                <div>No matching accounts found.</div>
              )}
              <div className="cursor-pointer" onClick={createAccount}>
                Add account
              </div>
            </Box>

            <div className={classes.sep}></div>

            <Box>
              {networks.map((net) => (
                <div
                  key={net.id}
                  className={clsx('cursor-pointer', {
                    [classes.active]: net.id === network,
                  })}
                  onClick={() => switchNetwork(net.id)}
                >
                  {net.name}
                </div>
              ))}
              <div onClick={startAddNetwork} className="cursor-pointer">
                Add Network
              </div>
            </Box>

            <div className={classes.sep}></div>

            <div className="cursor-pointer" onClick={goToSettings}>
              Settings
            </div>
            <div className="cursor-pointer" onClick={goToTransactions}>
              Transactions
            </div>

            <div className={classes.sep}></div>

            <div className="cursor-pointer" onClick={lock}>
              Lock
            </div>
            <div className="cursor-pointer" onClick={logOut}>
              Log Out
            </div>
          </Box>
        </Menu>
      </div>
    </Box>
  );
}

export default Header;
