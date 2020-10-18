import * as actionTypes from "./actionTypes";
import axios from "axios";

import store from "../myStore";

export const updateApp = (key, value) => {
  return {
    type: actionTypes.UPDATE_APP,
    key: key,
    value: value,
  };
};

export const updateAccount = (account) => {
  return {
    type: actionTypes.UPDATE_ACCOUNT,
    account: account,
  };
};

export const signatureLogin = () => {
  return (dispatch) => {
    var state = store.getState().AppReducer;

    const msg = "Authentication login request. Nonce: " + state.nonce;

    state.web3.eth.personal.sign(msg, state.account, function (err, result) {
      if (err) return console.error(err);
      if (result.error) {
        return console.error(result.error.message);
      }
      dispatch(loginOrSignUp(state.account, result));
    });
  };
};

export const loginOrSignUp = (account, signature = "") => {
  return (dispatch) => {
    axios
      .post("https://api.crypto-arcade.xyz/auth/login", {
        account: account,
        signature: signature,
      })
      .then(function (res) {
        if (res.status === 201) {
          // User found, sign nonce
          dispatch(updateApp("nonce", res.data["nonce"]));
          dispatch(updateApp("username", res.data["username"]));
          // console.log(res.data["nonce"]);
        } else if (res.status === 200) {
          localStorage.setItem("access_token", res.data["access_token"]);
          dispatch(updateApp("username", res.data["username"]));
          dispatch(updateApp("authenticated", true));
        }
      })
      .catch(function (err) {
        // Expecting 404 if user is not registered. Probably better way to handle this
        if (err.response.status === 500) {
          console.log(err.response.data);
        }
        dispatch(updateApp("authStatus", err.response.status));
      });
  };
};

export const signUp = (email, username, account) => {
  return (dispatch) => {
    axios
      .post("https://api.crypto-arcade.xyz/auth/register", {
        email: email,
        username: username,
        account: account,
      })
      .then((res) => {
        dispatch(updateApp("authStatus", null));
        dispatch(loginOrSignUp(account));
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };
};

export const buyTokens = (value) => {
  return (dispatch) => {
    var fullstate = store.getState();
    var state = fullstate.AstroReducer;
    var appState = fullstate.AppReducer;
    var tokens;

    state.AstroidInstance.methods
      .purchaseTensOfTokens(value / 10)
      .send({ from: appState.account, value: state.gameCost * value })
      .then((res) => {
        state.AstroidInstance.methods
          .getNumTokens(appState.account)
          .call()
          .then((res) => {
            tokens = res;
            dispatch(updateApp("tokens", tokens));
          });
      })
      .catch((err) => console.log(err));
  };
};
