import {cx, css} from '@emotion/css';

import {themes} from '../../../utilities';

const defaults = {
  color: themes.current.text,
  length: 24
};

const styles = {
  icon: css({
    display: 'block',
  })
}

function Icon(props) {
  const length = props.size || defaults.length;

  return (
    <svg
      className={cx(styles.icon)}
      style={{
        ...props.style,
        width: `${length}px`,
        height: `${length}px`,
        fill: props.color || defaults.color
      }}
      viewBox={props.viewBox || `0 0 24 24`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <use href={`#${props.name}Icon`} />
    </svg>
  );
}

export {Icon};