import {css, cx} from '@emotion/css';

import {themes, colors} from '../../utilities';

const styles = {
  box: css({
    borderRadius: '8px',
    backgroundColor: `white`,
    // boxShadow: `0px 2px 4px -4px ${colors.material.grey[900]}`,
    border: `1px solid ${colors.material.grey[200]}`,
  }),
  elevation1: css({
    boxShadow: `0px 0px 8px -4px ${themes.current.colors.shadow}`,
  }),
};

function Box(props) {
  const classNames = {
    [styles.box]: true,
    // [styles.elevation1]: props.elevation === 1,
  };
  if (props.className) {
    classNames[props.className] = true;
  }

  return (
    <div className={cx(classNames)}>
      {props.children}
    </div>
  );
}

export {Box};