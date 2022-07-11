import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

import { useVite } from '../../contexts/Vite';
import { BORDER_RADIUS } from '../../utils';

const useStyles = makeStyles((theme) => ({
  container: {
    background: theme.palette.secondary.main,
    color: 'black',
    borderRadius: BORDER_RADIUS,
  },
}));

function Error() {
  const classes = useStyles();
  const { error } = useVite();

  return !error ? null : (
    <Box className={classes.container} p={2} mx={2} mt={2}>
      {error.message}
    </Box>
  );
}

export default Error;
