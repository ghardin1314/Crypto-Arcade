import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  loading: false,
  account: null,
  network: null,
  authenticated: false,
  web3: null,
  web3Socket: null,
  authStatus: null,
  nonce: null,
  username: null,
  tokens: 0,
};

const updateApp = (state, action) => {
  return updateObject(state, {
    [action.key]: action.value,
  });
};

const updateAccount = (state, action) => {
  return updateObject(state, {
    account: action.account,
    // authenticated: true,
  });
};

const AppReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_APP:
      return updateApp(state, action);
    case actionTypes.UPDATE_ACCOUNT:
      return updateAccount(state, action);
    default:
      return state;
  }
};

export default AppReducer;
