import {Page} from '../components';
import {useWallet, Application, Transaction} from '../packages/Wallet';

function Demo(props) {
  const wallet = useWallet();

  const approvalCode = `
    #pragma version 6
    int 1
    return
  `;
  const clearCode = `
    #pragma version 6
    int 1
    return
  `;
  const application = new Application({
    approvalCode,
    clearCode,
    allocation: {
      global: {
        bytes: 2,
        integers: 3
      }
    }
  });

  const deploy = async () => {
    const transaction = await new Transaction().initialize();
    transaction.note = 'Testing #2022';
    transaction.prepare(await application.create(Application.behavior.callApproval));
    await wallet.sign(transaction);
  };

  return (
    <Page
      title="Pera Connect"
      subtitle="Simple app interface with the Pera Wallet"
    >
      <div>Demo</div>
      <div>
        <h3>
          {wallet.isOpen ? 'Open' : 'closed'}
        </h3>
        <button onClick={() => wallet.open()}>
          Open
        </button>
        <button onClick={() => wallet.close()}>
          Close
        </button>
      </div>
      <div>
        {wallet.account &&
          <button onClick={wallet.disconnect}>
            Disconnect
          </button>
        }
        {!wallet.account &&
          <button onClick={wallet.connect}>
            {wallet.isReady ? 'Connect' : 'Hydrating...'}
          </button>
        }
        <div>
          {wallet.account ? `Connected with ${wallet.account}` : ''}
        </div>
        {wallet.account &&
          <div>
            <button onClick={deploy}>
              Deploy
            </button>
          </div>
        }
      </div>
      <div>
        <pre>
          {JSON.stringify(wallet.transactions, null , 2)}
        </pre>
      </div>
    </Page>
  );
}

export {Demo};