import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

import { useVite } from '../../contexts/Vite';

const useStyles = makeStyles((theme) => ({
  container: {
    color: 'red',
  },
}));

function Error() {
  const classes = useStyles();
  const { error } = useVite();

  return (
    <Box className={classes.container}>
      {!error ? null : <div>{error.message}</div>}
    </Box>
  );
}

export default Error;
