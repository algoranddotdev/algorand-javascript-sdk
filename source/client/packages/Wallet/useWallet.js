import React from 'react';

import {Context} from './Wallet.jsx';

function useWallet() {
  const context = React.useContext(Context);
  return context;
}

export {useWallet};