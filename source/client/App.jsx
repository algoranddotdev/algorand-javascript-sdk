import React from 'react';
import {css, cx} from '@emotion/css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import {Wallet} from './packages/Wallet';

import * as routes from './routes';

import {Theme, Page, Icons} from './components';

import {themes, device} from '../utilities';

const styles = {
  app: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: themes.current.colors.horizon,
    color: themes.current.colors.text,
  }),
};

function App(props) {
  const theme = React.useContext(Theme.Context);

  return (
    <div className={cx(styles.app)}>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/demo" element={<routes.Demo />} />
      </Routes>
    </div>
  );
}

function WrappedApp(props) {
  return (
    <BrowserRouter>
      <Theme.Provider>
        <Wallet>
          <Icons />
          <App {...props} />
        </Wallet>
      </Theme.Provider>
    </BrowserRouter>
  );
}

export {WrappedApp as App};

