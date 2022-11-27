import React from 'react';
import {css, cx} from '@emotion/css';

import {themes, colors} from '../../../utilities';

const styles = {
  button: css({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0',
    padding: '10px 16px',
    background: `${colors.material.grey[50]}`,
    border: `1px solid ${colors.material.grey[400]}`,
    borderRadius: '4px',
    boxShadow: `0px 2px 4px -4px ${colors.material.grey[900]}`,
    color: colors.material.grey[800],
    fontWeight: '600',
    fontSize: '14px',
  }),
};

function Button(props) {
  const type = props.type === 'anchor' ? 'a' : 'button';
  
  return React.createElement(
    type,
    {
      className: cx(
        styles.button,
        props.className 
      )
    },
    props.title || props.children
  );
}

export {Button};