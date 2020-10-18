import React from "react";
// import { Link as RouterLink } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset';

import UserInfo from "../containers/UserInfo";

const useStyles = makeStyles((theme) => ({
  grow: {
    flex: 1,
  },
  toolbarButtons: {
    marginLeft: 'auto',
  },
  title: {
    marginRight: theme.spacing(2),
  }
}));

export default function CustomTopbar() {
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <AppBar style={{ margin: 0, background: "#000" }} position="fixed">
        <Toolbar>
          <Typography veriant="h6" className={classes.title}>CryptoArcade</Typography>
          <VideogameAssetIcon/>
          <Divider orientation="vertical" flexItem light={true} variant="middle"/>
          <div className={classes.toolbarButtons}>
            <UserInfo/>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
}
