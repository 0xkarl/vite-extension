import React from 'react';
import Button from '@material-ui/core/Button';

function Step4Finish() {
  const onSubmit = async (e) => {
    e.preventDefault();

    window.close();
  };

  return (
    <>
      <div>You can now access the extension in the browser toolbar above.</div>

      <div className="flex gap-2 items-center mt-4">
        <Button
          variant="contained"
          color="primary"
          disableElevation
          onClick={onSubmit}
        >
          Close
        </Button>
      </div>
    </>
  );
}

export default Step4Finish;
