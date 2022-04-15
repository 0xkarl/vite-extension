import React from 'react';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  container: {
    fontSize: 20,
  },
}));

function Heading({ children }) {
  const classes = useStyles();

  return (
    <Box mb={2} className={clsx('font-extrabold', classes.container)}>
      {children}
    </Box>
  );
}

export default Heading;
