import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";

import * as actions from "../../store/actions/AppActions";

export default function BuyTokensModal(props) {
  const state = useSelector((state) => state.AppReducer);
  const gameState = useSelector((state) => state.AstroReducer);
  const [value, setValue] = React.useState(10);

  const dispatch = useDispatch();

  const { onClose, open } = props;

  function valuetext(value) {
    return `${value} tokens`;
  }

  const handleClose = () => {
    onClose();
  };

  const handleValueChange = (e, value) => {
    setValue(value);
  };

  const handleConfirm = async () => {
    dispatch(actions.buyTokens(value));
    handleClose();
  };

  return (
    <div>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle id="form-dialog-title">Buy Tokens</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the amount of tokens you would like to buy. Each game
            costs one token and each token costs{" "}
            {state.web3.utils.fromWei(gameState.gameCost)} eth. Transactions
            take a few minutes to confirm on the blockchain. Warm up with some
            free games while you wait!
          </DialogContentText>
          <br />
          <br />
          <Slider
            defaultValue={10}
            getAriaValueText={valuetext}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="on"
            step={10}
            marks
            min={10}
            max={100}
            onChange={handleValueChange}
          />
          <br />
          <br />
          <DialogContentText>
            Total: {value * state.web3.utils.fromWei(gameState.gameCost)} eth
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleConfirm();
            }}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
