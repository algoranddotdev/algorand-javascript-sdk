import React from 'react';
import {css, cx} from '@emotion/css';

import {Context as NavigationContext} from '../Navigation';
import {Icon} from '../../Icons';
import {Box} from '../../Box.jsx';

import {themes, device} from '../../../../utilities';

const styles = {
  head: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  action: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '60px',
    height: '60px',
    margin: '0 8px 0 0',
    color: themes.current.colors.action.foreground,
  }),
  toggle: css({
    [device.media.desktop]: {
      display: 'none',
    }
  }),
  brand: css({
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '60px',
    fontSize: '18px',
    fontWeight: '500',
    [device.media.desktop]: {
      margin: '0 16px 0 16px',
    }
  }),
};

function Head(props) {
  const navigationContext = React.useContext(NavigationContext);

  return (
    <Box className={cx(styles.head)}>
      <div
        className={cx(
          styles.action,
          styles.toggle
        )}
        onClick={navigationContext.toggle}
      >
        <Icon name="Menu" />
      </div>
      <div className={cx(styles.brand)}>
        <span>
          Algorand
        </span>
        <span style={{opacity: '0.8'}}>
          .dev
        </span>
      </div>
    </Box>
  );
}

export {Head};