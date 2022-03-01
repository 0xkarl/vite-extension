import { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useVite } from '../contexts/Vite';
import { send, getQueryParams, sleep } from '../utils';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {
    '& button': {
      width: 100,
    },
  },
}));

function AddNetwork() {
  const classes = useStyles();
  const { setError } = useVite();
  const [saved, setSaved] = useState(false);

  async function onAddNetwork(e) {
    e.preventDefault();

    const name = (e.target.name.value || '').trim();
    const url = (e.target.url.value || '').trim();
    const txBlockExplorerUrl = (e.target.txBlockExplorerUrl.value || '').trim();

    setError(null);
    // await addNetwork(name, url);
    setSaved(true);
    await sleep(1000);
    setSaved(false);
  }

  return (
    <Box className={classes.container}>
      <Heading>
        Add Network <a href="#/">✕</a>
      </Heading>

      <form onSubmit={onAddNetwork}>
        <TextField
          id="name"
          label="Name"
          type="text"
          InputLabelProps={{
            shrink: true,
          }}
          placeholder="Type name..."
          fullWidth
          required
        />

        <Box mt={1}>
          <TextField
            id="url"
            label="Url"
            type="url"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Type url..."
            fullWidth
            required
          />
        </Box>

        <Box mt={1}>
          <TextField
            id="txBlockExplorerUrl"
            label="Block Explorer Url"
            type="url"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Type url..."
            fullWidth
            required
          />
        </Box>

        <Box mt={2}>
          <Button variant="outlined" size="small" type="submit">
            {saved ? 'Added✓' : 'Add'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default AddNetwork;
