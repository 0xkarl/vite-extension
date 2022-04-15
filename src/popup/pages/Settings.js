import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useVite } from '../contexts/Vite';
import { BORDER_RADIUS, send, sleep } from '../utils';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
  warning: {
    background: '#ffd9db',
    borderRadius: BORDER_RADIUS,
  },
}));

function Settings() {
  const classes = useStyles();
  const { logOut, setError } = useVite();
  const [copied, setCopied] = useState(false);
  const [exportedSeed, setExportedSeed] = useState(null);

  async function onExportSeed(e) {
    e.preventDefault();

    if (exportedSeed) {
      navigator.clipboard.writeText(exportedSeed);
      setCopied(true);
      await sleep(1000);
      setCopied(false);
      return;
    }

    const pass = (e.target.pass.value || '').trim();

    setError(null);
    try {
      const { mnemonic: exportedSeed } = await send('getMnemonic', { pass });
      setExportedSeed(exportedSeed);
    } catch (e) {
      setError(e);
    }
  }

  return (
    <Box className={classes.container}>
      <Heading>
        Settings <a href="#/">✕</a>
      </Heading>

      <div className="flex flex-col">
        <form onSubmit={onExportSeed}>
          {exportedSeed ? null : (
            <TextField
              id="pass"
              label="Export Mnemonic Phrase"
              type="password"
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Enter pass to export..."
              fullWidth
              required
            />
          )}
          {!exportedSeed ? null : (
            <>
              <TextField
                id="password"
                label={'Export Mnemonic Phrase'}
                type="password"
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder="Type password..."
                fullWidth
                multiline
                disabled
                defaultValue={exportedSeed}
              />
              <Box className={classes.warning} p={2} mt={2}>
                Do not share this phrase with anyone! These words can be used to
                steal all of your assets
              </Box>
            </>
          )}
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              size="small"
              type="submit"
            >
              {copied ? 'Copied✓' : exportedSeed ? 'Copy' : 'Export'}
            </Button>
          </Box>
        </form>

        <Box mt={2}>
          <Button variant="outlined" size="small" fullWidth onClick={logOut}>
            Reset wallet
          </Button>
        </Box>
      </div>
    </Box>
  );
}

export default Settings;
