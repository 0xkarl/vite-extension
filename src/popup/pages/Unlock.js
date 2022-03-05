import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useVite } from '../contexts/Vite';
import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Unlock() {
  const classes = useStyles();
  const { setError, unlock, logOut } = useVite();

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
          <Button variant="outlined" size="small" type="submit">
            Unlock
          </Button>
          <Box mx={1}>or</Box>
          <Button
            variant="outlined"
            size="small"
            type="button"
            onClick={onImport}
          >
            Import New
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default Unlock;
