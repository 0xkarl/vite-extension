import React, { useCallback, useMemo, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useVite } from '../contexts/Vite';
import { BORDER_RADIUS } from '../utils';

const useStyles = makeStyles((theme) => ({
  warning: {
    background: theme.palette.secondary.main,
    color: 'black',
    borderRadius: BORDER_RADIUS,
  },
}));

const useResetPrompt = () => {
  const classes = useStyles();
  const { openImportPage, setError, logOut } = useVite();

  const [show, setShow] = useState(false);

  async function onReset(e) {
    e.preventDefault();
    setError(null);
    await logOut();
    openImportPage();
  }

  const modal = useMemo(
    () => (
      <Dialog open={show} onClose={() => setShow(false)}>
        <Box p={4}>
          <Typography variant="h6" className="text-center">
            Resetting Wallet
          </Typography>
          <Box mt={1} px={2} py={1} className={classes.warning}>
            Completing this action will remove all data from your current
            wallet, including your secret recovery phrase.
            <br />
            Make sure to save your current seed phrase to gain control of your
            wallet in the future.
          </Box>
          <Box className="grid grid-cols-2 gap-2" mt={2}>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              onClick={onReset}
              disableElevation
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShow(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>
    ),
    [show, setShow]
  );

  const prompt = useCallback(() => {
    setShow(true);
  }, [setShow]);

  return { modal, prompt };
};

export default useResetPrompt;
