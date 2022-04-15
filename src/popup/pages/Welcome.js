import React from 'react';
import { Link } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

import logo from '../images/logo-white@2x.png';

const useStyles = makeStyles((theme) => ({
  container: {
    background: theme.palette.primary.main,
    color: 'white',
    '& button': {
      background: 'white',
    },
  },
  heading: {
    fontSize: 30,
  },
  subheading: {
    fontSize: 16,
  },
}));

function Welcome() {
  const classes = useStyles();

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
          Vite Wallet
        </div>
        <div className={clsx(classes.subheading, 'my-2 font-semibold')}>
          Unofficial wallet for Vite blockchain
        </div>
      </Box>

      <Box className="grid grid-cols-2 gap-2" mt={3}>
        <Link to={'/register'}>
          <Button
            variant="contained"
            color="default"
            disableElevation
            size="small"
            fullWidth
          >
            Create account
          </Button>
        </Link>
        <Link to={'/import'}>
          <Button
            variant="contained"
            color="default"
            disableElevation
            size="small"
            fullWidth
          >
            Import
          </Button>
        </Link>
      </Box>
    </Box>
  );
}

export default Welcome;
