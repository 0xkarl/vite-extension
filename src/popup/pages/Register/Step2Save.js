import React, { useState } from 'react';
import clsx from 'clsx';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';

function Step2Save({ nextStep, mnemonic, generate }) {
  const [showing, setShowing] = useState(false);

  return (
    <>
      <p className="center-align">
        Write these words down. Do not copy them to your clipboard, or save them
        anywhere online.
      </p>

      {showing ? (
        <>
          <div className={'flex justify-center  mt-4'}>
            <div className={'grid grid-cols-3 gap-4 flex-grow'}>
              {mnemonic.map(({ word, index }) => {
                return (
                  <Badge key={word} badgeContent={index + 1} color="primary">
                    <Button
                      variant="outlined"
                      fullWidth
                      color="default"
                      disableElevation
                    >
                      {word}
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 justify-center items-center mt-4">
            <Button
              variant="outlined"
              color="default"
              onClick={() => generate()}
              className="w-32"
            >
              Regenerate
            </Button>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={nextStep}
              className="w-32"
            >
              Confirm
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 items-center mt-4">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => setShowing(true)}
            >
              Reveal phrase
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default Step2Save;
