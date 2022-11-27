import React from 'react';
import {css, cx} from '@emotion/css';

import {Context as NavigationContext} from '../Navigation';

import {Box} from '../../Box.jsx';

import {themes} from '../../../../utilities';

const styles = {
  feet: css({
    margin: '0',
    padding: '16px',
  }),
  isHidden: css({
    display: 'none',
  }),
};

function Feet(props) {
  const navigation = React.useContext(NavigationContext);

  return (
    <Box
      className={cx({
        [styles.feet]: true,
        [styles.isHidden]: navigation.isVisible
      })}
    >
      Built by <a href="">Morgan</a>
    </Box>
  );
}

export {Feet};