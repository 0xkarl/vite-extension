import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import { send, getQueryParams, abbrAddress } from '../utils';
import { useVite } from '../contexts/Vite';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Connect() {
  const classes = useStyles();
  const { address } = useVite();

  const [state, _update] = useState({
    searchedAddresses: [],
  });
  const update = (a) => _update((b) => ({ ...b, ...a }));

  useEffect(() => {
    const load = async () => {
      const state = getQueryParams();
      ['tabId', 'id'].forEach((k) => (state[k] = parseInt(state[k])));
      update(state);
    };
    load();
  }, []);

  function onConnect() {
    const { tabId, id, origin, jsonrpc } = state;
    send('accountConnected', {
      tabId,
      id,
      jsonrpc,
      data: {
        origin,
        address,
      },
    });
    window.close();
  }

  return (
    <Box className={classes.container}>
      <div className="flex flex-col">
        <div>Address: {abbrAddress(address)}</div>
        <div>Origin: {state.origin}</div>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            size="small"
            onClick={onConnect}
          >
            Connect
          </Button>
        </Box>
      </div>
    </Box>
  );
}

export default Connect;
