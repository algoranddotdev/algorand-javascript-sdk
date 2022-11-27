import React from 'react';

const Context = React.createContext();

function Provider(props) {
  const [isVisible, setVisible] = React.useState(false);

  const toggle = () => {
    setVisible((isVisible) => !isVisible);
  };

  return (
    <Context.Provider
      value={{
        isVisible,
        toggle
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