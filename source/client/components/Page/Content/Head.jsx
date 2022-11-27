import {css, cx} from '@emotion/css';

import {themes, size, colors} from '../../../../utilities';

const styles = {
  head: css({
    margin: '0',
    padding: size.double,
    // background: colors.material.grey[50],
    borderRadius: '8px 8px 0 0',
    // boxShadow: `0 4px 10px -10px ${themes.current.colors.shadow}`,
  }),
  title: css({
    margin: '0',
    color: colors.material.grey[800],
    fontWeight: '500',
    fontSize: '24px',
  }),
  subtitle: css({
    margin: '8px 0 0 0',
    color: colors.material.grey[600],
    fontWeight: '400',
    fontSize: '16px',
  })
};

function Head(props) {
  return (
    <div className={cx(styles.head)}>
      <h1 className={cx(styles.title)}>
        {props.title}
      </h1>
      {props.subtitle &&
        <h2 className={cx(styles.subtitle)}>
          {props.subtitle}
        </h2>
      }
    </div>
  );
}

export {Head};