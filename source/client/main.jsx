import React from 'react';
import * as ReactDOM from 'react-dom/client';

import {App} from './App.jsx';

const rootNode = ReactDOM.createRoot(
  document.querySelector('#root')
);

rootNode.render(<App />);