# Algorand JavaScript SDK

The goal of this repository is to explore possible optimizations of integrating Algorand on the web client side. The main effort from the start was to create an optimized Algorand JavaScript SDK such that it's light, intuitive, and robust. To reduce scope, I made the decision to focus exclusively on the mobile web experience, and as such with Pera Algo Wallet as the sole compatible wallet.

Development started in early May and was halted in early August. I just couldn't overcome Pera Algo Wallet and WalletConnect issues (dropped connections and an opaque bridge API). I halted development in order to focus on rebuilding the mobile wallet experience, which later morphed into Kenimo – the developer focused native iOS Algorand wallet. The intent was to complete an MVP of Kenimo first and then pick up the development of this JavaScript SDK for Algorand, but with a robust, open wallet target.

## Structure

This is a React (client) + Fastify (server) project. In terms of client-side dependencies, I managed to only require `algo-msgpack-with-bigint`, and no other default Algorand JavaScript SDK dependencies.

The source code is structured under `source/client` and `source/server` but all the intersting parts can be found in `source/client/packages/Wallet`.

There, I've abstracted enough Algorand constructs to test TEAL application deployment, including base `Account`, `Application`, `Teal`, `Transaction` classes and all the utilities those classes depend on. Specifically, Base 32 and 64 encodings, SHA512/256 hash and digest functions. I've also worked on a custom WalletConnect `SocketController`, which is where I had to halt development due to Pera Algo Wallet and WalletConnect/WebSocket issues.

Because I created custom abstractions over Algorand primitives like `Transaction` I was able to create a new interface with accessible names and structures, and not something that's barely a wrapper over MessagePack structures.

When Kenimo entered the picture, it became possible to design a new web-app-to-wallet protocol to communicate transaction information that's encoded as JSON or some other accessible format and completetly offload MessagePack work to the mobile wallet.

## Algorand JavaScript SDK - Sample Interaction

You can see what I was going for in terms of a JavaScript SDK for Algorand in the `/source/client/routes/Demo.jsx` component. Specifically, this section.

```javascript
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
```

By calling `deploy()` on your phone browser, you will be instantly taken to the signature screen of your mobile wallet, that's the intention at least. This way, the user flow is much faster.

## Running

Instructions to run this project locally.

```sh
npm i
npm run development
```

In order to have access to native mobile browser crypto functions, while working locally, you'll need to use an encrypted connection to the running Node app. I use `ngrok`. After executing the following command you'll get two forwarding addresses, when opening this app on your phone use the `https` URL.

```sh
ngrok https -region eu 3010
```

When you have it running, make sure to open the ngrok URL on your phone. I took screenshots of the current flow of connecting to your Pera Algo wallet account.

![Home Screen](/documentation/assets/screen.home.png)

Tap the hamburger menu icon on the top left.

![Navigation Screen](/documentation/assets/screen.navigation.png)

Open the Demo page.

![Demo Screen](/documentation/assets/screen.demo.png)

Tap "Open" to open the WebSocket connection to Pera Algo wallet.

![Opened Screen](/documentation/assets/screen.opened.png)

Tap "Connect" and you'll this prompt.

![Prompt Screen](/documentation/assets/screen.prompt.png)

Which takes you to the Pera Algo wallet account connect prompt.

![Pera Screen](/documentation/assets/screen.pera.png)

## Testing

Most of the primitive structures have unit tests, but since I'm publishing this in an unfinished state, 23 tests are failing (out of 88 total tests).

```sh
npm run test
```
