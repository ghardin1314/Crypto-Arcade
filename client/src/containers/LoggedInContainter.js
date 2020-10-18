import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import LogoutButton from "../components/Authentication/LogoutButton";
import UserTokenInfo from "../components/Tokens/UserTokenInfo";
import BuyTokensModal from "../components/Tokens/BuyTokensModal";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
  },
  buyBtn: {
    backGroundColor: theme.palette.tertiary.main,
  },
}));

export default function LoggedInContainter() {
  const classes = useStyles();
  const state = useSelector((state) => state.AppReducer);
  const gameState = useSelector((state) => state.AstroReducer);
  const [openTokens, setOpenTokens] = React.useState(false);

  const handleTokensOpen = () => {
    setOpenTokens(true);
  };

  const handleTokensClose = () => {
    setOpenTokens(false);
  };
  return (
    <React.Fragment>
      <Grid
        container
        className={classes.container}
        spacing={2}
        alignItems="center"
      >
        <Grid item>
          <Typography>Welcome, {state.username}!</Typography>
        </Grid>
        <Grid item>
          <UserTokenInfo />
        </Grid>

        <Grid item>
          {gameState.gameCost ? (
            <Button
              variant="contained"
              className={classes.buyBtn}
              onClick={handleTokensOpen}
            >
              Buy Tokens
            </Button>
          ) : null}
        </Grid>
        <Grid item>
          <LogoutButton />
        </Grid>
      </Grid>
      {openTokens ? (
        <BuyTokensModal open={openTokens} onClose={handleTokensClose} />
      ) : null}
    </React.Fragment>
  );
}
