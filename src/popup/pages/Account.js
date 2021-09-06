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

function Account({
  match: {
    params: { address },
  },
}) {
  const classes = useStyles();
  const { addressesInfo, setError, saveAccountName } = useVite();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportedPrivateKey, setExportedPrivateKey] = useState(null);

  useEffect(() => {
    const { name } = addressesInfo[address] || {};
    setName(name);
  }, [address]);

  async function onSaveName(e) {
    e.preventDefault();

    const name = (e.target.name.value || '').trim();

    setError(null);
    await saveAccountName(address, name);
    setSaved(true);
    await sleep(1000);
    setSaved(false);
  }

  async function onExportPrivateKey(e) {
    e.preventDefault();

    if (exportedPrivateKey) {
      navigator.clipboard.writeText(exportedPrivateKey);
      setCopied(true);
      await sleep(1000);
      setCopied(false);
      return;
    }

    const pass = (e.target.pass.value || '').trim();

    setError(null);
    try {
      const { exportedPrivateKey } = await send('exportPrivateKey', {
        address,
        pass,
      });
      setExportedPrivateKey(exportedPrivateKey);
    } catch (e) {
      setError(e);
    }
  }

  return (
    <Box className={classes.container}>
      <Heading>
        Account Details <a href="#/">✕</a>
      </Heading>

      <form onSubmit={onSaveName}>
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
          defaultValue={name}
        />

        <Box mt={2}>
          <Button variant="outlined" size="small" type="submit">
            {saved ? 'Saved✓' : 'Save'}
          </Button>
        </Box>
      </form>

      <Box mt={3}>
        <form onSubmit={onExportPrivateKey}>
          {exportedPrivateKey ? null : (
            <TextField
              id="pass"
              label="Export Private Key"
              type="password"
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Enter pass to export..."
              fullWidth
              required
            />
          )}
          {!exportedPrivateKey ? null : (
            <TextField
              id="password"
              label={exportedPrivateKey ? 'Export Private Key' : 'Password'}
              type="password"
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Type password..."
              fullWidth
              multiline
              disabled
              defaultValue={exportedPrivateKey}
            />
          )}
          <Box mt={2}>
            <Button variant="outlined" size="small" type="submit">
              {copied ? 'Copied✓' : exportedPrivateKey ? 'Copy' : 'Export'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

export default Account;
