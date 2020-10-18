import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Button from "@material-ui/core/Button";

import { InstantiateContract } from "../../services";

import * as appActions from "../../store/actions/AppActions";

export default function LoginButton() {
  // const classes = useStyles();
  const state = useSelector((state) => state.AppReducer);

  const dispatch = useDispatch();

  useEffect(
    () => {
      if (state.nonce && state.username) {
        dispatch(appActions.signatureLogin())
      }
    },
    // eslint-disable-next-line
    [state.nonce, state.username]
  );

  async function handleLogin() {
    InstantiateContract();
  }

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={handleLogin}>
        Login or Sign Up
      </Button>
    </div>
  );
}
