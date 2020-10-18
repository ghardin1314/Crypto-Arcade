import React from "react";
import { useSelector} from "react-redux";
import LoginButton from "../components/Authentication/LoginButton";
import LoggedInContainer from "./LoggedInContainter"

export default function UserInfo() {
  const state = useSelector((state) => state.AppReducer);

  return <div>{!state.authenticated ? <LoginButton /> : <LoggedInContainer />}</div>;
}
