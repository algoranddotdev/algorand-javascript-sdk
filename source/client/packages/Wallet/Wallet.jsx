import React from 'react';

import {Algorand, Application, Teal, Account, Transaction} from './Algorand';
import {Connector} from './Connector';

const Context = React.createContext();

function reducer(state, action) {
  console.log(action.type);
  switch (action.type) {
    case 'didOpen': {
      return {
        ...state,
        isOpen: true
      };
    }
    case 'didClose': {
      return {
        ...state,
        isOpen: false
      };
    }
    case 'didHydrate': {
      return {
        ...state,
        isHydrated: true
      };
    }
    case 'didConnect': {
      return {
        ...state,
        account: Connector.main.account
      };
    }
    case 'didDisconnect': {
      return {
        ...state,
        account: null
      };
    }
    case 'addTransaction': {
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            requestId: action.payload,
            state: 'assembled'
          }
        ]
      };
    }
    case 'didSignTransaction': {
      return {
        ...state,
        transactions: state.transactions.map((transaction) => {
          if (transaction.requestId === action.payload) {
            return {
              ...transaction,
              state: 'signed'
            };
          } else {
            return transaction;
          }
        })
      };
    }
    case 'didBroadcastTransaction': {
      return {
        ...state,
        transactions: state.transactions.map((transaction) => {
          if (transaction.requestId === action.payload.requestId) {
            return {
              ...transaction,
              id: action.payload.transactionId,
              state: 'broadcast'
            };
          } else {
            return transaction;
          }
        })
      };
    }
    default: {
      return state;
    }
  }
}

function Provider(props) {
  const [state, dispatch] = React.useReducer(reducer, {
    isOpen: false,
    isHydrated: false,
    account: null,
    transactions: []
  });

  const audioRef = React.useRef(null);

  const hydrate = async () => {
    // Listen for key events.
    Connector.main.listen('didConnect', () => {
      dispatch({type: 'didConnect'});
    });
    Connector.main.listen('didDisconnect', () => {
      dispatch({type: 'didDisconnect'});
    });
    Connector.main.listen('didSign', async ({requestId, decodedTransaction}) => {
      dispatch({
        type: 'didSignTransaction',
        payload: requestId
      });
      try {
        const transactionId = await Algorand.main.broadcastRawTransaction(decodedTransaction);
        dispatch({
          type: 'didBroadcastTransaction',
          payload: {
            requestId,
            transactionId
          }
        });
      } catch (error) {
        console.log(error);
      }
    });

    // Hydrate Connector.
    await Connector.main.hydrate();
    dispatch({type: 'didHydrate'});
  };

  React.useEffect(() => {
    hydrate();
  }, []);

  // External interface.
  const isReady = state.isHydrated;
  const account = state.account;

  const connect = async () => {
    // audioRef.current?.play();
    const deepLink = await Connector.main.connect();
    window.location = deepLink;
  };
  const disconnect = async () => {
    await Connector.main.disconnect();
  };
  const open = async () => {
    await Connector.main.open();
    dispatch({type: 'didOpen'});
  };
  const close = async () => {
    if (Connector.main && Connector.main.socket && Connector.main.socket.socket) {
      Connector.main.close();
      dispatch({type: 'didClose'});
    }
  };
  const sign = React.useCallback(
    async (transaction) => {
      if (!transaction.sender) {
        transaction.sender = state.account;
      }
      const requestId = await Connector.main.sign(transaction);
        dispatch({
          type: 'addTransaction',
          payload: requestId
        });
        window.location = `algorand://`;
    },
    [state.account]
  );
  const deploy = React.useCallback(
    async ({application, note} = {note: null}) => {
      // await open();
      // audioRef.current?.play();
      if (state.account) {
        const transaction = await new Transaction().initialize();
        transaction.sender = state.account;
        transaction.note = note;
        transaction.prepare(await application.create(Application.behavior.callApproval));
        const requestId = await Connector.main.sign(transaction);
        dispatch({
          type: 'addTransaction',
          payload: requestId
        });
        window.location = `algorand://`;
      }
    },
    [state.account]
  )

  // React.useEffect(() => {
  //   let shouldStop = true;
  //   for (const transaction of state.transactions) {
  //     if (transaction.state === 'assembled') {
  //       shouldStop = false;
  //       break;
  //     }
  //   }

  //   if (shouldStop) {
  //     close();
  //   }
  // }, [state.transactions]);

  return (
    <Context.Provider
      value={{
        isOpen: state.isOpen,
        isReady,
        account,
        transactions: state.transactions,
        open,
        close,
        connect,
        disconnect,
        deploy,
        sign
      }}
    >
      <audio
        id="SocketKeeper"
        ref={audioRef}
        src="/assets/silence.mp3"
        hidden
      />
      {props.children}
    </Context.Provider>
  );
}

export {Context, Provider};