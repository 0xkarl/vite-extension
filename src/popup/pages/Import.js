import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import { useVite } from '../contexts/Vite';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Import() {
  const classes = useStyles();
  const { setError, importAccount } = useVite();
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    const mnemonic = (e.target.mnemonic.value || '').trim();
    const password = (e.target.password.value || '').trim();
    const confirmPassword = (e.target.cpassword.value || '').trim();

    setError(null);
    if (password !== confirmPassword) {
      return setError(new Error('Passwords do not match.'));
    }

    await importAccount(mnemonic, password);
    setDone(true);
  };

  const onDone = () => {
    window.close();
  };

  return (
    <Box className={clsx(classes.container, 'p-4')}>
      <Heading>{done ? <>Success!</> : <>Import account</>}</Heading>

      {done ? (
        <>
          <div>
            You can now access the extension in the browser toolbar above.
          </div>

          <div className="flex gap-2 items-center mt-4">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={onDone}
            >
              Close
            </Button>
          </div>
        </>
      ) : (
        <form {...{ onSubmit }}>
          <TextField
            id="mnemonic"
            label="Mnemonic"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Type mnemonic..."
            fullWidth
            required
            multiline
          />

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

          <Box mt={2}>
            <TextField
              id="cpassword"
              label="Confirm"
              type="password"
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Confirm password..."
              fullWidth
              required
            />
          </Box>

          <div className="flex gap-2 items-center mt-4">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              type="submit"
            >
              Import
            </Button>
            <div>or</div>
            <Link to={'/register'}>
              <Button variant="outlined" color="default" type="button">
                Create account
              </Button>
            </Link>
          </div>
        </form>
      )}
    </Box>
  );
}

export default Import;
