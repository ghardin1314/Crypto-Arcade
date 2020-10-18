import React from "react";
import { useSelector } from "react-redux";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: 10000,
    position: "absolute",
    color: "#fff",
  },
}));

export default function LoadingBackdrop() {
  const classes = useStyles();
  const state = useSelector((state) => state.AppReducer);

  return (
    <div>
      <Backdrop className={classes.backdrop} open={state.loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
