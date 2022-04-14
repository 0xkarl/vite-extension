import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useVite } from '../contexts/Vite';
import Heading from '../components/shared/Heading';
import { BORDER_RADIUS } from '../utils';

const useStyles = makeStyles(() => ({
  container: {},
  warning: {
    background: '#ffd9db',
    borderRadius: BORDER_RADIUS,
  },
}));

function Unlock() {
  const classes = useStyles();
  const { setError, unlock, logOut } = useVite();
  const [showImportWarning, setShowImportWarning] = useState(false);
  const router = useHistory();

  function onSubmit(e) {
    e.preventDefault();

    const password = (e.target.password.value || '').trim();

    setError(null);
    unlock(password);
  }

  function onImport(e) {
    e.preventDefault();

    setError(null);
    logOut();
    router.push('/import');
  }

  return (
    <Box className={classes.container}>
      <Heading>Unlock account</Heading>

      <form {...{ onSubmit }}>
        <TextField
          id="password"
          label="Password"
          type="password"
          InputLabelProps={{
            shrink: true,
          }}
          placeholder="Type password..."
          fullWidth
          required
        />
        <Box className="flex items-center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            type="submit"
            disableElevation
          >
            Unlock
          </Button>
        </Box>
      </form>

      <Box
        mt={2}
        className="text-primary cursor-pointer underline"
        onClick={() => setShowImportWarning(true)}
      >
        Import Using Secret Recovery Phrase
      </Box>

      <Dialog
        open={showImportWarning}
        onClose={() => setShowImportWarning(false)}
      >
        <Box p={4}>
          <Typography variant="h6" className="text-center">
            Resetting Wallet
          </Typography>
          <Box mt={1} px={2} py={1} className={classes.warning}>
            Completing this action will remove all data from your current
            wallet, including your secret recovery phrase.
            <br />
            Make sure to save your current seed phrase to gain control of your
            wallet in the future.
          </Box>
          <Box className="flex justify-between" mt={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowImportWarning(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              onClick={onImport}
              disableElevation
            >
              Unlock
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

export default Unlock;
