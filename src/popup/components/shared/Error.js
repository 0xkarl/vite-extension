import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

import { useVite } from '../../contexts/Vite';
import { BORDER_RADIUS } from '../../utils';

const useStyles = makeStyles(() => ({
  container: {
    background: '#ffd9db',
    borderRadius: BORDER_RADIUS,
  },
}));

function Error() {
  const classes = useStyles();
  const { error } = useVite();

  return !error ? null : (
    <Box className={classes.container} p={2} mb={2}>
      {error.message}
    </Box>
  );
}

export default Error;
