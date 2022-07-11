import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

import logo from '../images/logo.png';
import { useVite } from '../contexts/Vite';

const useStyles = makeStyles((theme) => ({
  container: {},
  heading: {
    fontSize: 30,
    color: theme.palette.primary.main,
  },
  subheading: {
    fontSize: 15,
  },
}));

function Welcome() {
  const classes = useStyles();
  const { openImportPage, openRegisterPage } = useVite();

  return (
    <Box
      className={clsx(
        classes.container,
        'flex flex-col justify-center h-full p-8'
      )}
    >
      <Box className="flex flex-col flex-grow items-center justify-end">
        <img src={logo} alt={'logo'} width={170} />

        <div className={clsx(classes.heading, 'my-2 font-extrabold')}>
          Volt Wallet
        </div>
        <div className={clsx(classes.subheading, 'my-2 font-semibold')}>
          Elegant wallet for the Vite ecosystem
        </div>
      </Box>

      <Box className="grid grid-cols-2 gap-2" mt={3}>
        <Button
          variant="contained"
          color="default"
          disableElevation
          size="small"
          fullWidth
          onClick={openRegisterPage}
        >
          Create account
        </Button>
        <Button
          variant="contained"
          color="default"
          disableElevation
          size="small"
          fullWidth
          onClick={openImportPage}
        >
          Import
        </Button>
      </Box>
    </Box>
  );
}

export default Welcome;
