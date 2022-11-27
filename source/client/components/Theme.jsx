import React from 'react';

import {themes} from '../../utilities';

const Context = React.createContext();

function Provider(props) {
  const [theme, setTheme] = React.useState(themes.current);

  React.useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    metaThemeColor.setAttribute('content', theme.colors.horizon);
  }, []);

  return (
    <Context.Provider
      value={{
        ...theme,
        setTheme
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export {
  Context,
  Provider
};