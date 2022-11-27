import {material} from './colors';

const themes = {
  dark: {
    colors: {
      horizon: material.grey[900],
      background: material.grey[800],
      text: material.grey[50],
    }
  },
  light: {
    colors: {
      horizon: material.grey[200],
      head: material.grey[50],
      navigation: material.grey[50],
      feet: material.grey[50],
      background: material.grey[50],
      darker: material.grey[200],
      dark: material.grey[400],
      darkest: material.grey[900],
      text: material.grey[800],
      action: {
        background: `linear-gradient(${material.grey[100]} 20%, ${material.grey[300]})`,
        foreground: material.grey[800],
        border: `1px solid ${material.grey[400]}`,
        shadow: `0px 0px 2px -1px ${material.grey[900]}`,
      },
      shadow: material.grey[900],
    }
  }
};

themes.current = themes.light;

export {themes};