const constants = {
  peraWallet: {
    serversUrl: 'https://wc.perawallet.app/servers.json'
  }
};

async function pickRandomBridge() {
  // Query available servers, then pick a random one.
  const response = await fetch(constants.peraWallet.serversUrl);
  if (response.ok) {
    const responseJson = await response.json();
    if (responseJson.servers && responseJson.servers.length > 0) {
      console.log(responseJson);
      // Generate a random number between 0 and the server count.
      const random = Math.floor(
        Math.random() *
        responseJson.servers.length
      );

      return responseJson.servers[random];
    }
  }

  throw `Error: couldn't fetch a WalletConnect bridge.`;
}

export {pickRandomBridge};