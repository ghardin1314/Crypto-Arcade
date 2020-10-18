import React, { Component } from "react";
import { connect } from "react-redux";
import Ship from "./Ship";
import Asteroid from "./Asteroid";
import { randomNumBetweenExcluding } from "./helpers";

import { withStyles } from "@material-ui/core/styles";

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
    // alignItems:'center',
    justifyContent: "center",
    display: "flex",
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

class Reacteroids extends Component {
  constructor() {
    super();
    this.state = {
      screen: {
        width: Math.min(window.innerWidth, 1500),
        height: Math.min(window.innerHeight * 0.5, 550),
        ratio: 10,
      },
      context: null,
      keys: {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        space: 0,
      },
      asteroidCount: 2,
      currentScore: 0,
      topScore: localStorage["topscore"] || 0,
      inGame: false,
    };
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];

    this.handleResize = this.handleResize.bind(this);
  }

  handleResize(value, e) {
    this.setState({
      screen: {
        width: Math.min(this.divElement.clientWidth, 1500),
        height: Math.min(this.divElement.clientHeight, 550),
        ratio: 1,
      },
    });
  }

  handleKeys(value, e) {
    let keys = this.state.keys;
    if (this.state.inGame) {
      e.preventDefault();
    }
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;
    this.setState({
      keys: keys,
    });
  }

  componentDidMount() {
    window.addEventListener("keyup", this.handleKeys.bind(this, false));
    window.addEventListener("keydown", this.handleKeys.bind(this, true));
    window.addEventListener("resize", this.handleResize);

    this.setState({
      screen: {
        width: Math.min(this.divElement.clientWidth, 1500),
        height: Math.min(this.divElement.clientHeight, 550),
        ratio: 1,
      },
    });

    const context = this.refs.canvas.getContext("2d");
    this.setState({ context: context });

    // this.startGame();
    requestAnimationFrame(() => {
      this.update();
    });
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.handleKeys);
    window.removeEventListener("keydown", this.handleKeys);
    window.removeEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps) {
    if (this.props.inGame === true && prevProps.inGame === false) {
      this.startGame();
    }
  }

  update() {
    const context = this.state.context;
    // eslint-disable-next-line
    const keys = this.state.keys;
    // eslint-disable-next-line
    const ship = this.ship[0];

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = "#000";
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    // Next set of asteroids
    if (!this.asteroids.length) {
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count);
    }

    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.ship, this.asteroids);

    // Remove or render
    this.updateObjects(this.particles, "particles");
    this.updateObjects(this.asteroids, "asteroids");
    this.updateObjects(this.bullets, "bullets");
    this.updateObjects(this.ship, "ship");

    // Draw score
    var score = "Score: " + this.state.currentScore;
    context.fillStyle = "white";
    context.textBaseline = "top";
    context.textAlign = "left";
    context.font = "20px Roboto";
    context.fillText(score, this.state.screen.width / 2, 10);

    context.restore();

    // Next frame
    requestAnimationFrame(() => {
      this.update();
    });
  }

  addScore(points) {
    if (this.props.inGame) {
      this.setState({
        currentScore: this.state.currentScore + points,
      });
    }
  }

  startGame() {
    // this.props.onStartGame();

    // Make ship
    let ship = new Ship({
      position: {
        x: this.state.screen.width / 2,
        y: this.state.screen.height / 2,
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this),
    });
    this.createObject(ship, "ship");

    // Make asteroids
    this.asteroids = [];

    this.setState({ asteroidCount: 3 });
    this.setState({ inGame: true });

    // this.generateAsteroids(this.asteroidCount);
  }

  gameOver() {
    this.setState({ inGame: false });
    this.props.onEndGame();

    // Replace top score
    if (this.state.currentScore > this.state.topScore) {
      this.setState({
        topScore: this.state.currentScore,
      });
      localStorage["topscore"] = this.state.currentScore;
    }
    this.setState({
      keys: {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        space: 0,
      },
      currentScore: 0,
    });
  }

  generateAsteroids(howMany) {
    // eslint-disable-next-line
    let asteroids = [];
    let ship = this.ship[0];
    let shipx = this.state.screen.width / 2;
    let shipy = this.state.screen.height / 2;

    if (ship) {
      // eslint-disable-next-line
      let shipx = ship.position.x;
      // eslint-disable-next-line
      let shipy = ship.position.y;
    }

    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: 80,
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.state.screen.width,
            shipx - 200,
            shipx + 200
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.screen.height,
            shipy - 200,
            shipy + 200
          ),
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this),
      });
      this.createObject(asteroid, "asteroids");
    }
  }

  createObject(item, group) {
    this[group].push(item);
  }

  updateObjects(items, group) {
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      } else {
        items[index].render(this.state);
      }
      index++;
    }
  }

  checkCollisionsWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for (a; a > -1; --a) {
      b = items2.length - 1;
      for (b; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];
        if (this.checkCollision(item1, item2)) {
          item1.destroy();
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1, obj2) {
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if (length < obj1.radius + obj2.radius) {
      return true;
    }
    return false;
  }

  render() {
    // eslint-disable-next-line
    // let endgame;
    // let message;

    const { classes } = this.props;

    // if (this.state.currentScore <= 0) {
    //   message = "0 points... So sad.";
    // } else if (this.state.currentScore >= this.state.topScore) {
    //   message = "Top score with " + this.state.currentScore + " points. Woo!";
    // } else {
    //   message = this.state.currentScore + " Points though :)";
    // }

    // if (!this.props.inGame) {
    //   endgame = (
    //     <div className="endgame">
    //       <p>Game over, man!</p>
    //       <p>{message}</p>
    //       <button onClick={this.startGame.bind(this)}>try again?</button>
    //     </div>
    //   );
    // }

    return (
      <div>
        {/* { endgame } */}
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
)(withStyles(useStyles)(Reacteroids));
