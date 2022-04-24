import React, { useMemo, useState } from 'react';
import shuffle from 'lodash/shuffle';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';

import { sleep } from '../../utils';

const useStyles = makeStyles(() => ({
  buttonError: {
    background: '#f48fb1 !important',
  },
  buttonHighlight: {
    background: '#90caf9 !important',
  },
}));

function Step3Confirm({ nextStep, goBack, mnemonic }) {
  const classes = useStyles();

  const [inputMnemonic, setInputMnemonic] = useState([]);
  const [wordState, setWordState] = useState({});
  const inputMnemonicIsValid = inputMnemonic.length === mnemonic.length;

  const shuffledMnemonic = useMemo(() => shuffle(mnemonic), [mnemonic]);

  const hintWord = async ({ state, index }) => {
    setWordState({ index, state });
    await sleep(300);
    setWordState({});
  };

  const onClickWord = async ({ index, word }) => {
    if (index !== inputMnemonic.length) {
      return await hintWord({ index, state: 'buttonError' });
    }
    setInputMnemonic(inputMnemonic.concat(word));
  };

  const onRevealNextWord = async () => {
    await hintWord({
      index: inputMnemonic.length,
      state: 'buttonHighlight',
    });
  };

  return (
    <>
      <p className="center-align">
        Click the words of your phrase in order.
        <br />
        If you&lsquo;ve forgotten the next word, click the &ldquo;Reveal Next
        Word&rdquo; button below.
      </p>

      <div className={'flex justify-center mt-4'}>
        <div className={'grid grid-cols-3 gap-4 flex-grow'}>
          {shuffledMnemonic.map(({ word, index }) => {
            const isValid = inputMnemonic[index];
            return (
              <Badge
                key={word}
                badgeContent={index + 1}
                color="primary"
                invisible={!isValid}
              >
                <Button
                  variant={
                    wordState.index === index
                      ? 'contained'
                      : isValid
                      ? 'contained'
                      : 'outlined'
                  }
                  fullWidth
                  color="default"
                  className={clsx(
                    wordState.index !== index ? null : classes[wordState.state]
                  )}
                  onClick={() => onClickWord({ word, index })}
                  disableElevation
                >
                  {word}
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 items-center mt-4">
        <Button variant="outlined" color="default" fullWidth onClick={goBack}>
          Back
        </Button>

        <Button
          variant="outlined"
          color="default"
          fullWidth
          onClick={onRevealNextWord}
        >
          Reveal Next Word
        </Button>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          disableElevation
          onClick={nextStep}
          disabled={!inputMnemonicIsValid}
        >
          Done
        </Button>
      </div>
    </>
  );
}

export default Step3Confirm;
