import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import TextField from '@material-ui/core/TextField';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';

import { send } from '../../utils';
import { useVite } from '../../contexts/Vite';

const useStyles = makeStyles(() => ({
  container: {},

  active: {
    color: '#006fe9',
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
    lock,
    switchAccount,
  } = useVite();

  const [{ network, networks, searchedAddresses }, _update] = useState({
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
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [addresses]);

  async function switchNetwork(network) {
    update(await send('switchNetwork', { network }));
  }

  function goToSettings() {
    hideMenu();
    router.push('/settings');
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
        <div className="flex flex-grow items-center">
          <div className="flex flex-grow">{network}</div>
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
            <div className="cursor-pointer" onClick={lock}>
              Lock
            </div>
          </Box>
        </Menu>
      </div>
    </Box>
  );
}

export default Header;
