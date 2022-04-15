import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';

import Heading from '../components/shared/Heading';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Deposit() {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Heading>Deposit</Heading>

      <Box mt={2}>TODO</Box>
    </Box>
  );
}

export default Deposit;
