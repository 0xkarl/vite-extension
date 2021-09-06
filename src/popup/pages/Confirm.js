import { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useVite } from '../contexts/Vite';
import { send, getQueryParams } from '../utils';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Confirm() {
  const classes = useStyles();
  const { setError } = useVite();

  const [state, _update] = useState({
    searchedAddresses: [],
  });
  const update = (a) => _update((b) => ({ ...b, ...a }));

  useEffect(() => {
    const { tabId, id, type, params } = getQueryParams();

    update({
      tabId: parseInt(tabId),
      id: parseInt(id),
      confirming: false,
      working: false,

      type,
      params,
    });
  }, []);

  async function onConfirm(e) {
    e.preventDefault();

    const { tabId, id, jsonrpc, params, type } = state;

    setError(null);
    update({ working: true });
    try {
      const result = await send('confirmTx', {
        params: JSON.parse(params),
        type,
      });
      console.log(result);
      // update({ txBlockExplorerUrl: txBlockExplorerUrl(hash) });
      // await send('waitForTx', { hash });
      send('result', {
        tabId,
        id,
        jsonrpc,
        result,
      });
      window.close();
    } catch (e) {
      setError(e);
    } finally {
      update({ working: false });
    }
  }

  function onCancel() {
    const { tabId, id, jsonrpc } = state;
    send('error', {
      tabId,
      id,
      jsonrpc,
      error: {
        code: 4001,
        message: 'MetaMask Tx Signature: User denied transaction signature.',
      },
    });
    window.close();
  }

  return (
    <Box className={classes.container}>
      <form onSubmit={onConfirm}>
        <Heading>Create AccountBlock</Heading>

        <Box mt={2}>
          <TextField
            id="type"
            label="Type"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            defaultValue={state.type}
            disabled
            multiline
          />
        </Box>

        <Box mt={2}>
          <TextField
            id="params"
            label="Params"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            defaultValue={state.params}
            multiline
            disabled
          />
        </Box>

        <div className="flex mt-3">
          <Button
            variant="outlined"
            size="small"
            type="submit"
            disabled={state.working}
          >
            {state.working ? 'Sending...' : 'Confirm'}
          </Button>
          <Box ml={1}>
            <Button
              variant="outlined"
              size="small"
              type="submit"
              onClick={onCancel}
              disabled={state.working}
            >
              Cancel
            </Button>
          </Box>
        </div>

        {/*
  
            {!txBlockExplorerUrl ? null :          <div className="mt-3">
          Track on{' '}
          <a href={state.txBlockExplorerUrl} target="_blank" className="text-bold">
            block explorer
          </a>
        </div> }
        
        */}
      </form>
    </Box>
  );
}

export default Confirm;
