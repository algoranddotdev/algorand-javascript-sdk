import React from 'react';
import {css, cx} from '@emotion/css';
import {Link} from 'react-router-dom';

import {Context} from './Context.jsx';

import {Box} from '../../Box.jsx';

import {themes, device, size} from '../../../../utilities';

const styles = {
  navigation: css({
    flex: '1',
    display: 'none',
    boxSizing: 'border-box',
    margin: `${size.half}px 0 0 0`,
    padding: '16px',
    [device.media.tablet]: {
      display: 'block',
    },
    [device.media.desktop]: {
      display: 'block',
      margin: `${2 * size.half}px 0 0 0`,
    },
  }),
  isVisible: css({
    display: 'block',
  }),
};

function Navigation(props) {
  const context = React.useContext(Context);

  return (
    <Box
      className={cx({
        [styles.navigation]: true,
        [styles.isVisible]: context.isVisible
      })}
    >
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/demo">Demo</Link>
        </li>
      </ol>
    </Box>
  );
}

export {Navigation};