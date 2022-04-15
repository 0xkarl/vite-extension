import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import QRCode from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy as copyIcon,
  faCheck as copiedIcon,
} from '@fortawesome/free-solid-svg-icons';

import { sleep, abbrAddress } from '../utils';
import Heading from '../components/shared/Heading';
import { useVite } from '../contexts/Vite';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Deposit() {
  const classes = useStyles();
  const { address } = useVite();
  const [copied, setCopied] = useState(false);

  async function copy() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    await sleep(1000);
    setCopied(false);
  }

  return (
    <Box className={classes.container}>
      <Heading>
        Deposit <a href="#/">✕</a>
      </Heading>

      <Box className="flex flex-col items-center" mt={2}>
        <Box className="flex items-center" onClick={copy}>
          <span className="text-primary font-bold mr-2">
            {abbrAddress(address)}
          </span>
          <div className="flex items-center cursor-pointer">
            {copied ? (
              <FontAwesomeIcon
                icon={copiedIcon}
                className="flex items-center"
              />
            ) : (
              <FontAwesomeIcon icon={copyIcon} className="flex items-center" />
            )}
          </div>
        </Box>

        <Box my={2}>or scan</Box>

        <QRCode value={address} size={128 * 2} />
      </Box>
    </Box>
  );
}

export default Deposit;
