import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import * as actions from "../../store/actions/AstroActions";
import * as appActions from "../../store/actions/AppActions";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  dialog: {
    flexGrow: 1,
    width: "80vw",
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export default function Leaderboard() {
  const classes = useStyles();

  const [scores, setScores] = useState([]);
  const [page, setPage] = useState(0);

  const state = useSelector((state) => state.AstroReducer);
  const appState = useSelector((state) => state.AppReducer);

  const dispatch = useDispatch();

  useEffect(() => {
    getScores();
    // eslint-disable-next-line
  }, []);

  function createData(username, score, date, account) {
    score = parseInt(score);
    username = appState.web3.utils.toUtf8(username);
    date = new Date(date * 1000).toLocaleString();
    return { username, score, date, account };
  }

  function getPayout(numGames, place) {
    var j = (numGames * 50) / 100;
  
    var sum = (j * (j + 1) * (2 * j + 1)) / 6;
  
    return ((j - place) * (j - place)) / sum;
  }

  async function getScores() {
    updateApp("loading", true);

    if (state.AstroidInstance !== null) {
      var myScores = [];
      const numScores = await state.AstroidInstance.methods
        .topscoresLength()
        .call();

      var numGames = parseInt(await await state.AstroidInstance.methods.topscoresLength().call());
      var currentPot = await state.AstroidInstance.methods.getPot().call();


      for (var i = 0; i < numScores; i++) {
        let score = await state.AstroidInstance.methods
          .MonthTopScores(i)
          .call();

        myScores.push(
          createData(score.userName, score.score, score.dateTime, score.account)
        );
      }

      // Sort scores
      myScores.sort((a, b) =>
        a.score < b.score ? 1 : b.score < a.score ? -1 : 0
      );

      // Add palacements
      for (i = 0; i < myScores.length; i++) {
        myScores[i].place = i + 1;
        if (i < myScores.length/2) {
          myScores[i].payout = (getPayout(numGames,i) *appState.web3.utils.fromWei(appState.web3.utils.numberToHex((currentPot )))).toFixed(4);
        } else {
          myScores[i].payout = 0;
        }
      }

      setScores(myScores);
      updateApp("loading", false);
    }
  }

  function updateApp(key, value) {
    dispatch(appActions.updateApp(key, value));
  }

  function updateAstro(key, value) {
    dispatch(actions.updateAstro(key, value));
  }

  const handleClose = () => {
    updateAstro("leaderboardOpen", false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const rowsPerPage = 5;

  return (
    <Dialog
      className={classes.Dialog}
      onClose={handleClose}
      open={state.leaderboardOpen}
      maxWidth="lg"
    >
      <DialogContent>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Place</TableCell>
              <TableCell>Username</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">Current Est. Payout (eth)</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">Account</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scores
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((score) => (
                <TableRow key={score.place}>
                  <TableCell component="th" scope="row">
                    {score.place}
                  </TableCell>
                  <TableCell align="right">{score.username}</TableCell>
                  <TableCell align="right">{score.score}</TableCell>
                  <TableCell align="center">{score.payout}</TableCell>
                  <TableCell align="right">{score.date}</TableCell>
                  <TableCell align="right">{score.account}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5]}
          component="div"
          count={scores.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
        />
      </DialogContent>
    </Dialog>
  );
}
