import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

import { useVite } from '../../contexts/Vite';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Step1Generate({ nextStep, generate }) {
  const classes = useStyles();
  const { setError } = useVite();

  const onSubmit = async (e) => {
    e.preventDefault();

    const password = (e.target.password.value || '').trim();
    const confirmPassword = (e.target.cpassword.value || '').trim();

    setError(null);
    if (password !== confirmPassword) {
      return setError(new Error('Passwords do not match.'));
    }

    generate(password);
    nextStep();
  };

  return (
    <form {...{ onSubmit }} className={classes.container}>
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

      <div className="mt-2">
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
      </div>

      <div className="flex gap-2 items-center mt-4">
        <Button
          variant="contained"
          color="primary"
          disableElevation
          type="submit"
        >
          Create account
        </Button>
        <div>or</div>
        <Link to={'/import'}>
          <Button
            variant="outlined"
            color="default"
            disableElevation
            size="small"
            type="button"
          >
            Import
          </Button>
        </Link>
      </div>
    </form>
  );
}

export default Step1Generate;
