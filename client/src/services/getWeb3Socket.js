import Web3 from "web3";

const getWeb3Socket = () =>
  new Promise(async (resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    // Modern dapp browsers...
    const provider = new Web3.providers.WebsocketProvider(
      "wss://rinkeby.infura.io/ws/v3/cf9ad3f6a2624c9dbcffb1c558fdb6da"
    );
    const web3 = new Web3(provider);
    resolve(web3);
  });

export default getWeb3Socket;
