import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

import { useVite } from '../contexts/Vite';
import Heading from '../components/shared/Heading';
import { BORDER_RADIUS } from '../utils';
import useResetPrompt from '../hooks/useResetPrompt';

const useStyles = makeStyles(() => ({
  container: {},
  warning: {
    background: '#ffd9db',
    borderRadius: BORDER_RADIUS,
  },
}));

function Unlock() {
  const classes = useStyles();
  const { setError, unlock } = useVite();
  const reset = useResetPrompt();

  function onSubmit(e) {
    e.preventDefault();

    const password = (e.target.password.value || '').trim();

    setError(null);
    unlock(password);
  }

  return (
    <Box className={clsx(classes.container, 'p-4')}>
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
            disableElevation
            size="small"
            type="submit"
          >
            Unlock
          </Button>
        </Box>
      </form>

      <Box
        mt={2}
        className="text-primary cursor-pointer underline"
        onClick={reset.prompt}
      >
        Import Using Secret Recovery Phrase
      </Box>

      {reset.modal}
    </Box>
  );
}

export default Unlock;
