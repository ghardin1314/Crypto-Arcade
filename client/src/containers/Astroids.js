import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import { makeStyles } from "@material-ui/core/styles";

import Reacteroids from "../components/Reacteroids/Reacteroids";
import ReacteroidsClient from "../components/ReacteroidsClient/ReacteroidsClient";
import Popper from "@material-ui/core/Popper";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import * as actions from "../store/actions/AstroActions";
import * as appActions from "../store/actions/AppActions";
import { InstantiateContract, refreshJwt } from "../services";
import Leaderboard from "../components/Reacteroids/Leaderboard";
import SignUpModal from "../components/Authentication/SignUpModal";

const useStyles = makeStyles((theme) => ({
  base: {
    display: "flex",
    backgroundImage: `url(https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?cs=srgb&dl=pexels-adrien-olichon-2387793.jpg&fm=jpg)`,
    maxWidth: "100vw",
    height: "100vh",
    marginTop: -64,
    backgroundSize: "cover",
    flexFlow: "column",
    backgroundRepeat: "repeat",
  },
  root: {
    display: "flex",
    flexFlow: "column",
    marginTop: 64,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 30,
  },
  btnContainer: {
    paddingTop: 20,
  },
  popper: {
    maxWidth: "50%",
  },
  papper: {
    background: theme.palette.tertiary.main,
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  directions: {
    display: "flex",
    flexDirection: "row",
  },
  content: {
    flex: "1 0 auto",
  },
  paper: {
    background: "transparent",
    padding: "5px",
    borderColor: theme.palette.tertiary.main,
  },
  typo: {
    color: theme.palette.tertiary.main,
  },
}));

export default function Astroids() {
  const classes = useStyles();
  const refEl = useRef(null);
  const state = useSelector((state) => state.AstroReducer);
  const appState = useSelector((state) => state.AppReducer);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const dispatch = useDispatch();

  useEffect(
    () => {
      setAnchorEl(refEl.current);
      checkAuth();
      // instantiateContract();
    },
    // eslint-disable-next-line
    []
  );

  async function checkAuth() {
    var access_token = localStorage.getItem("access_token");
    if (access_token) {
      refreshJwt(access_token).then(function (access_token) {
        if (access_token) {
          const tokenData = jwt_decode(access_token);
          if (
            tokenData["sub"] === appState.account ||
            appState.account === null
          ) {
            updateApp("username", tokenData["name"]);
            updateAccount(tokenData["sub"]);
            updateApp("authenticated", true);
            InstantiateContract(tokenData["sub"]);
            setInterval(function () {});
          } else {
            localStorage.removeItem("access_token");
          }
        }
      });
    }
  }

  function startGame(gameType) {
    dispatch(actions.startAstro(gameType));
  }

  function updateAccount(account) {
    dispatch(appActions.updateAccount(account));
  }

  function updateApp(key, value) {
    dispatch(appActions.updateApp(key, value));
  }

  function updateAstro(key, value) {
    dispatch(actions.updateAstro(key, value));
  }

  function showLeaderboard() {
    updateAstro("leaderboardOpen", true);
  }

  return (
    <Grid container className={classes.base} justify="center" align="center">
      <div ref={refEl} className={classes.root}>
        {state.gameType === "paid" ? <ReacteroidsClient /> : <Reacteroids />}
        <div style={{ padding: 20 }}>
          <Grid
            className={classes.directions}
            container
            justify="center"
            spacing={2}
          >
            <Grid item>
              <Paper className={classes.paper} variant="outlined" elevation={0}>
                <Typography className={classes.typo} variant="subtitle1">
                  Use [A][W][D] or [←][↑][→] to MOVE
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper className={classes.paper} variant="outlined" elevation={0}>
                <Typography className={classes.typo} variant="subtitle1">
                  Use [SPACE] to SHOOT
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Popper
          open={!state.inGame}
          disablePortal={true}
          anchorEl={anchorEl}
          placement="bottom"
          className={classes.popper}
          popperOptions={{
            modifiers: {
              offset: {
                offset: "0,-80%",
              },
            },
          }}
        >
          <Paper className={classes.papper}>
            <Grid
              container
              justify="center"
              alignContent="center"
              alignItems="center"
              spacing={2}
              className={classes.container}
            >
              <Grid item md>
                <Typography component="h5" variant="h6">
                  Welcome to Crypto Arcade, an arcade that pays you to win! It
                  works like a traditional arcade, but with a twist. You get one
                  game per token and if you make it into the top 50% of scores
                  by the end of the month, you get a payout! After a cut to fund
                  the dev team, the winnings are paid out quadratically, so the
                  higher your placing, the higher your payout! Scores are reset
                  every month.
                  <br />
                  <br />
                  Crypto Arcade is powered by Etherium and requires the browser
                  extension{" "}
                  <a
                    target="_blank"
                    href="https://metamask.io/"
                    rel="noopener noreferrer"
                  >
                    MetaMask
                  </a>{" "}
                  to play "paid" games. It is currently in beta and free to play
                  on the Etherium Rinkeby Test Network. Go{" "}
                  <a
                    target="_blank"
                    href="https://faucet.rinkeby.io/"
                    rel="noopener noreferrer"
                  >
                    here
                  </a>{" "}
                  to get free test Eth to play.
                  <br />
                  <br />
                  If you want to learn more about the project, check out my {" "}
                  <a
                    target="_blank"
                    href="https://medium.com/@g.hardin1314/crypto-arcade-my-first-ethereum-dapp-where-high-scores-pay-f78a11d74a8"
                    rel="noopener noreferrer"
                  >
                    Medium article walkthrough
                  </a>
                  , or the project{" "}
                  <a
                    target="_blank"
                    href="https://github.com/ghardin1314/Crypto-Arcade"
                    rel="noopener noreferrer"
                  >
                    Github repository
                  </a>{" "}
                  . Feel free to leave a star while you're there!
                  <br />
                  <br />
                  Dont want to go through the hassle of getting funds? See if
                  you can beat the top scores on the leaderboard in a free game!
                </Typography>
              </Grid>
              <Grid
                container
                justify="center"
                alignContent="center"
                alignItems="center"
                spacing={2}
                className={classes.btnContainer}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => startGame("paid")}
                    disabled={
                      !appState.authenticated ||
                      !appState.web3 ||
                      !state.AstroidInstance ||
                      appState.tokens === "0"
                    }
                  >
                    Play Paid
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => startGame("free")}
                  >
                    Play Free
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={showLeaderboard}
                  >
                    View Leaderboard
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Popper>
        {state.leaderboardOpen ? <Leaderboard /> : null}
        <SignUpModal />
      </div>
    </Grid>
  );
}
