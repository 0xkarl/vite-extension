import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';

import { useVite } from '../contexts/Vite';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Import() {
  const router = useHistory();
  const classes = useStyles();
  const { setError, importAccount } = useVite();

  const onSubmit = (e) => {
    e.preventDefault();

    const mnemonic = (e.target.mnemonic.value || '').trim();
    const password = (e.target.password.value || '').trim();
    const confirmPassword = (e.target.cpassword.value || '').trim();

    setError(null);
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    importAccount(mnemonic, password);
  };

  return (
    <Box className={classes.container}>
      <Heading>Import account</Heading>

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

        <Box className="flex items-center" mt={3}>
          <Button variant="outlined" size="small" type="submit">
            Import
          </Button>
          <Box mx={1}>or</Box>
          <Button
            variant="outlined"
            size="small"
            type="button"
            onClick={() => router.push('/register')}
          >
            Create account
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default Import;
