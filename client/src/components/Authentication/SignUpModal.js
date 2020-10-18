import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import * as EmailValidator from "email-validator";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import * as actions from "../../store/actions/AppActions";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "50ch",
  },
}));

export default function SignUpModal() {
  const classes = useStyles();
  const state = useSelector((state) => state.AppReducer);

  const [username, setUsername] = React.useState(null);
  const [usernameErrorTxt, setUsernameErrorTxt] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [emailErrorTxt, setEmailErrorTxt] = React.useState(null);

  const dispatch = useDispatch();

  function updateApp(key, value) {
    dispatch(actions.updateApp(key, value));
  }

  function signUp() {
    dispatch(actions.signUp(email, username, state.account));
  }

  function handleEmailChange(e) {
    var res = EmailValidator.validate(e.target.value);
    if (res) {
      setEmail(e.target.value);
      setEmailErrorTxt(null);
    } else {
      setEmailErrorTxt("Please enter valid email");
    }
  }

  function handleUsernameChange(e) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var enteredName = e.target.value;
    var res = usernameRegex.test(enteredName);
    if (res && enteredName.length > 3 && enteredName.length < 13) {
      setUsername(enteredName);
      setUsernameErrorTxt(null);
    } else {
      if (enteredName.length !== 0) {
        setUsernameErrorTxt("Username must be 4-12 letters or numbers");
      }
    }
  }

  return (
    <div>
      <Dialog open={state.authStatus === 404 ? true : false}>
        <DialogTitle id="form-dialog-title">Sign Up</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To play a paid game please enter a value username and email. Emails
            will be used to update you about potential winnings and future
            updates from the project!
          </DialogContentText>
          <Grid
            container
            className={classes.container}
            spacing={2}
            justify="center"
            alignContent="center"
            alignItems="center"
          >
            <Grid
              item
              md
            >
              <TextField
                variant="outlined"
                className={classes.textField}
                error={usernameErrorTxt ? true : false}
                required
                label="Username"
                onBlur={handleUsernameChange}
                helperText={usernameErrorTxt}
                margin="normal"
              ></TextField>
            </Grid>
            <Grid item md>
              <TextField
                variant="outlined"
                className={classes.textField}
                required
                error={emailErrorTxt ? true : false}
                label="Email"
                type="email"
                onChange={handleEmailChange}
                helperText={emailErrorTxt}
              ></TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              updateApp("authStatus", null);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            disabled={!email || !username}
            onClick={() => {
              signUp();
            }}
            color="primary"
          >
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
