import React from "react";
import { useDispatch } from "react-redux";
import Button from "@material-ui/core/Button";
import * as appActions from "../../store/actions/AppActions";



export default function LogoutButton() {
  const dispatch = useDispatch();

  function handleLogout() {
    localStorage.removeItem("access_token");
    dispatch(appActions.updateApp("username", null));
    dispatch(appActions.updateApp("authenticated", false));
    dispatch(appActions.updateApp("nonce", null));
  }

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
}
