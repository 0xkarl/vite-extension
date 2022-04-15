import React from 'react';
import { LoaderIcon } from 'react-hot-toast';

const Loader = ({ text }) => {
  return (
    <div className="flex items-center">
      <span className="mr-1">{text} ...</span>
      <LoaderIcon />
    </div>
  );
};

export default Loader;
