import getWeb3 from "./getWeb3";
import getWeb3Socket from "./getWeb3Socket";
import store from "../store/myStore";

import * as actions from "../store/actions/AstroActions";
import * as appActions from "../store/actions/AppActions";

import AstroidsContract from "../contracts/AstroidsContract.json";

function updateAccount(account) {
  store.dispatch(appActions.updateAccount(account));
}

function updateApp(key, value) {
  store.dispatch(appActions.updateApp(key, value));
}

function updateAstro(key, value) {
  store.dispatch(actions.updateAstro(key, value));
}

function loginOrSignUp(account, signature = "") {
  return store.dispatch(appActions.loginOrSignUp(account, signature));
}

async function instantiateContract(account = null) {
  try {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();
    const web3Socket = await getWeb3Socket();

    updateApp("web3", web3);
    updateApp("web3Socket", web3Socket)

    const accounts = await web3.eth.getAccounts();
    
    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    try {
      const deployedNetwork = AstroidsContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AstroidsContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      const socketInstance = new web3Socket.eth.Contract(
        AstroidsContract.abi,
        deployedNetwork && deployedNetwork.address
      )
      //get current gameCost
      updateAstro("AstroidInstance", instance)
      updateAstro("AstroidSocket", socketInstance)
      const gameCost = await instance.methods.gameCost().call();
      updateAstro("gameCost", gameCost);
      const userTokens = await instance.methods
        .getNumTokens(accounts[0])
        .call();
      updateApp("tokens", userTokens);
    } catch (error) {
      alert(
        `Failed to connect to smart contract. Please install metamask and choose rinkeby network`
      );
    }

    //on refresh, if jwt token account doesn't equal metamask, unauth
    if ((account && account !== accounts[0]) || !account) {
      updateApp("authenticated", false);
      updateApp("username", null);
      localStorage.removeItem("access_token");
      updateAccount(accounts[0]);
      loginOrSignUp(accounts[0]);
    }
  } catch (error) {
    // Catch any errors for any of the above operations.
    alert(
      `Failed to load web3, accounts, or contract. Check console for details.`
    );
    console.log(error);
  }
}

export default instantiateContract;
