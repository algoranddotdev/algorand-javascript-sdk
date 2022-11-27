import React from 'react';
import {css, cx} from '@emotion/css';

import {Context as NavigationContext} from '../Navigation';

import {Box} from '../../Box.jsx';
import {Button} from '../../Button';

import {Head} from './Head.jsx';

import {themes} from '../../../../utilities';

const styles = {
  container: css({
    flex: '1',
  }),
  isHidden: css({
    display: 'none',
  }),
  content: css({
    padding: '16px',

  }),
};

function Content(props) {
  const navigation = React.useContext(NavigationContext);

  return (
    <Box
      className={cx({
        [styles.container]: true,
        [styles.isHidden]: navigation.isVisible
      })}
      elevation={1}
    >
      <Head
        title={props.title}
        subtitle={props.subtitle}
      />
      <div className={cx(styles.content)}>
        {props.children}
      </div>
    </Box>
  );
}

export {Content};