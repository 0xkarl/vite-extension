import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';

import { useVite } from '../../contexts/Vite';
import Heading from '../../components/shared/Heading';
import Step1Generate from './Step1Generate';
import Step2Save from './Step2Save';
import Step3Confirm from './Step3Confirm';
import Step4Finish from './Step4Finish';

const useStyles = makeStyles(() => ({
  container: {},
}));

function Register() {
  const classes = useStyles();
  const { register } = useVite();
  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState([]);
  const [, setPassword] = useState('');

  const nextStep = () => {
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setStep((s) => s - 1);
  };

  const generate = async (password) => {
    if (password) {
      setPassword(password);
    }
    const { mnemonic } = await register(password);
    setMnemonic(mnemonic.split(' ').map((word, index) => ({ word, index })));
  };

  return (
    <Box className={clsx(classes.container, 'p-4')}>
      <Heading>
        {step === 1 ? (
          <>Generate mnemonic</>
        ) : step === 2 ? (
          <>Save mnemonic</>
        ) : step === 3 ? (
          <>Confirm</>
        ) : step === 4 ? (
          <>Success!</>
        ) : null}
      </Heading>

      <div className="flex flex-col flex-grow">
        {step === 1 ? (
          <Step1Generate {...{ nextStep, generate }} />
        ) : step === 2 ? (
          <Step2Save {...{ nextStep, mnemonic, generate }} />
        ) : step === 3 ? (
          <Step3Confirm {...{ nextStep, mnemonic, goBack }} />
        ) : step === 4 ? (
          <Step4Finish {...{}} />
        ) : null}
      </div>
    </Box>
  );
}

export default Register;
