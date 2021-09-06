import { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useVite } from '../contexts/Vite';
import { send } from '../utils';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Settings() {
  const classes = useStyles();
  const { logOut } = useVite();
  const [copied, setCopied] = useState(false);

  async function copySeed() {
    if (confirm('Copy seed?')) {
      const { mnemonic } = await send('getMnemonic');
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  }

  return (
    <Box className={classes.container}>
      <Heading>
        Settings <a href="#/">✕</a>
      </Heading>

      <div className="flex flex-col">
        <Button variant="outlined" size="small" fullWidth onClick={copySeed}>
          {copied ? 'Copied✓' : 'Copy seed'}
        </Button>

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
