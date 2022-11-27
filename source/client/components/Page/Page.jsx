import React from 'react';
import {css, cx} from '@emotion/css';

import {Head} from './Head';
import {
  Navigation,
  Provider as NavigationProvider
} from './Navigation';
import {Content} from './Content';
import {Feet} from './Feet';

import {themes, device, size} from '../../../utilities';

const styles = {
  page: css({
    flex: '1',
    display: 'flex',
    margin: size.single,
    flexDirection: 'column',
    background: themes.current.colors.horizon,
    fontSize: '14px',
    [device.media.desktop]: {
      margin: 4 * size.single,
    },
  }),
  body: css({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    [device.media.tablet]: {
      flexDirection: 'row',
    },
    [device.media.desktop]: {
      flexDirection: 'row',
    },
  }),
  meta: css({
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    [device.media.mobile]: {
      margin: `0 0 ${size.half}px 0`,
    }
  }),
  content: css({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    margin: `0 0 ${size.half}px 0`,
    [device.media.desktop]: {
      margin: `0 0 0 ${2 * size.half}px`,
    },
  }),
  feet: css({
    margin: '0',
    [device.media.desktop]: {
      margin: `${2 * size.half}px 0 0 0`,
    },
  }),
};

function Page(props) {
  return (
    <NavigationProvider>
      <div className={cx(styles.page)}>
        <div className={cx(styles.body)}>
          <div className={cx(styles.meta)}>
            <Head />
            <Navigation />
          </div>
          <div className={cx(styles.content)}>
            <Content title={props.title} subtitle={props.subtitle}>
              {props.children}
            </Content>
          </div>
        </div>
        <div className={cx(styles.feet)}>
          <Feet />
        </div>
      </div>
    </NavigationProvider>
  );
}

export {Page};