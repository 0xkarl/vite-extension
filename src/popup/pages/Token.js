import React from 'react';

import Heading from '../components/shared/Heading';
import Txns from '../components/shared/Transactions';

function Token({
  match: {
    params: { token },
  },
}) {
  return (
    <div>
      <Heading>
        Token: {token} <a href="#/">✕</a>
      </Heading>

      <Txns {...{ token }} />
    </div>
  );
}

export default Token;
