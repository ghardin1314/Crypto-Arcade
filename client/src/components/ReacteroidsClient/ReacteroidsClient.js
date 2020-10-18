import React, { Component } from "react";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";

import Astroid from "./AsteroidClient";
import Ship from "./ShipClient";
import Bullet from "./BulletClient";
import Particle from "./ParticleClient";

import io from "socket.io-client";

import * as actions from "../../store/actions/AstroActions";

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

const useStyles = (theme) => ({
  root_astro: {
    // height: "80vh",
    justifyContent:'center',
    display: 'flex',
  },
  top: {
    flex: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
});

class ReacteroidsClient extends Component {
  constructor() {
    super();
    this.socket = io("https://server.crypto-arcade.xyz");
    this.state = {
      screen: {
        width: Math.min(window.innerWidth, 1500),
        height: Math.min(window.innerHeight * 0.8, 550),
        ratio: 1,
      },
      context: null,
      gameCode: null,
      currentScore: 0,
      topScore: localStorage["topscore"] || 0,
    };
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];

    this.handleResize = this.handleResize.bind(this)
  }

  componentDidMount() {
    const access_token = localStorage.getItem("access_token");

    this.socket.on("connect", () => {
      this.socket
        .emit("authenticate", { token: access_token })
        .on("authenticated", () => {
          this.beginGame();
          //
        })
        .on("unauthorized", (msg) => {
          alert("Sorry, unauthorized connection. Please log in and try again");
        });
    });

    this.socket.on("gameState", (gameState) => {
      gameState = JSON.parse(gameState);
      requestAnimationFrame(() => this.paintGame(gameState));
    });

    this.socket.on("gameOver", (gameState) => {
      gameState = JSON.parse(gameState);
      // this.sendScore(parseInt(gameState.currentScore));
      this.props.onEndGame();
    });

    this.socket.on("gameCode", (gameCode) => {
      this.setState({
        gameCode: gameCode,
      });
    });

    window.addEventListener("keyup", this.handleKeys.bind(this, false));
    window.addEventListener("keydown", this.handleKeys.bind(this, true));
    window.addEventListener("resize", this.handleResize);

    let myScreen = {
      width: Math.min(this.divElement.clientWidth, 1500),
      height: Math.min(this.divElement.clientHeight, 550),
      ratio: 1,
    };

    this.setState({
      screen: {
        ...myScreen,
      },
    });

    const context = this.refs.canvas.getContext("2d");
    this.setState({ context });
  }

  beginGame() {
    let myScreen = {
      width: Math.min(this.divElement.clientWidth, 1500),
      height: Math.min(this.divElement.clientHeight, 550),
      ratio: 1,
    };

    this.socket.emit("resize", myScreen);
    this.socket.emit("startGame");
  }

  // TODO: currently just starts on mount. Leaving this for adjusting in the future
  // componentDidUpdate(prevProps) {
  //   if (
  //     this.props.inGame === true &&
  //     prevProps.inGame === false &&
  //     this.props.gameType === "paid"
  //   ) {
  //     if (this.state.gameCode) {
  //       this.socket.emit("startGame", this.state.gameCode, this.state.screen);
  //     } else {
  //       alert("Not connected to server");
  //     }
  //   }
  // }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.handleKeys);
    window.removeEventListener("keydown", this.handleKeys);
    window.removeEventListener("resize", this.handleResize);
    this.socket.emit("disconnect");
  }

  handleResize(e) {
    let myScreen = {
      width: Math.min(this.divElement.clientWidth, 1500),
      height: Math.min(this.divElement.clientHeight, 550),
      ratio: 1,
    };
    this.setState({
      screen: {
        ...myScreen,
      },
    });

    this.socket.emit("resize", this.state.screen);
  }

  handleKeys(value, e) {
    for(var keyVal in KEY) {
      if (e.keyCode === keyVal) e.preventDefault();
    }
    this.socket.emit("keydown", e.keyCode, value);
  }

  paintGame(gameState) {
    const context = this.state.context;
    // eslint-disable-next-line
    const ship = this.ship[0];

    this.setState({
      currentScore: gameState.currentScore,
    });

    context.save();
    context.scale(gameState.screen.ratio, gameState.screen.ratio);

    context.fillStyle = "#000";
    context.globalAlpha = 0.8;
    context.fillRect(0, 0, gameState.screen.width, gameState.screen.height);
    context.globalAlpha = 1;

    //Update State of objects
    this.updateObjects(gameState.asteroids, "asteroids", Astroid);
    this.updateObjects(gameState.ship, "ship", Ship);
    this.updateObjects(gameState.bullets, "bullets", Bullet);
    this.updateObjects(gameState.particles, "particles", Particle);

    //Render Objects
    this.paintObjects(this.asteroids, gameState);
    this.paintObjects(this.ship, gameState);
    this.paintObjects(this.bullets, gameState);
    this.paintObjects(this.particles, gameState);

    // Draw score
    var score = "Score: " + gameState.currentScore;
    context.fillStyle = "white";
    context.textBaseline = "top";
    context.textAlign = "left";
    context.font = "20px Roboto";
    context.fillText(score, gameState.screen.width / 2, 10);

    context.restore();
  }

  createObject(item, group) {
    this[group].push(item);
  }

  updateObjects(items, group, myClass) {
    this[group] = [];

    for (let item of items) {
      let newItem = new myClass({
        ...item,
        create: this.createObject.bind(this),
      });
      this.createObject(newItem, group);
    }
  }

  paintObjects(items, gameState) {
    for (let item of items) {
      item.render(this.state);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div
          className={classes.root_astro}
          ref={(divElement) => {
            this.divElement = divElement;
          }}
        >
          <canvas
            ref="canvas"
            width={this.state.screen.width * this.state.screen.ratio}
            height={this.state.screen.height * this.state.screen.ratio}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    inGame: state.AstroReducer.inGame,
    authenticated: state.AppReducer.authenticated,
    account: state.AppReducer.account,
    gameType: state.AstroReducer.gameType,
    AstroidInstance: state.AstroReducer.AstroidInstance,
    gameCost: state.AstroReducer.gameCost,
    web3: state.AppReducer.web3,
    username: state.AppReducer.username,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // onStartGame: () => dispatch(actions.startAstro()),
    onEndGame: () => dispatch(actions.endAstro()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(useStyles)(ReacteroidsClient));
