import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";

import * as actions from "../../store/actions/AppActions";

const toolTip = `Blockchain may take a few minutes to confirm game.
  Tokens shown do not reflect unconfirmed games. Scores 
  from games played after all tokens have been spent will 
  not be counted.`;

const useStyles = makeStyles((theme) => ({
  paper: {
    background: "transparent",
    padding: "5px",
    borderColor: theme.palette.tertiary.main,
  },
  typo: {
    color: theme.palette.tertiary.main,
  },
}));

export default function UserTokenInfo() {
  const classes = useStyles();
  const state = useSelector((state) => state.AppReducer);
  const gameState = useSelector((state) => state.AstroReducer);

  const dispatch = useDispatch();

  useEffect(
    () => {
      if (gameState.AstroidSocket) {
        let subscription = gameState.AstroidSocket.events
          .newScore({ filter: { _from: state.account } })
          
          subscription.on("data", function(event){
            console.log("Token Spent")
            let token = event.returnValues
            dispatch(actions.updateApp("tokens", token.tokens))
          }).on('error', errCallback);
      }

    },
    // eslint-disable-next-line
    []
  );

  function errCallback(error) {
    console.log(error)
  }

  return (
    <div>
      <Paper className={classes.paper} variant="outlined" elevation={0}>
        <Tooltip title={toolTip}>
          <div>
            <Typography className={classes.typo} variant="subtitle1">
              Game Tokens*: {state.tokens}
            </Typography>
          </div>
        </Tooltip>
      </Paper>
    </div>
  );
}
