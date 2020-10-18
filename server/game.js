let Asteroid = require("./Asteroid");
let Ship = require("./Ship");
let { randomNumBetweenExcluding } = require("./helpers");

module.exports = {
  createGameState,
  gameLoop,
  createInitialShip,
};

function createInitialShip(gameState) {
  let ship = new Ship({
    position: {
      x: gameState.screen.width / 2,
      y: gameState.screen.height / 2,
    },
    create: createObject.bind(this),
    onDie: gameOver.bind(this),
  });

  createObject(ship, "ship", gameState);

  gameState.asteroids = [];

  gameState.asteroidCount = 3;
}

function createGameState() {
  let gameState = {
    screen: {
      //TODO: dynamic screen sizing
      width: 600,
      height: 600,
      ratio: 1,
    },
    keys: {
      left: 0,
      right: 0,
      up: 0,
      down: 0,
      space: 0,
    },
    asteroidCount: 2,
    currentScore: 0,
    ship: [],
    asteroids: [],
    bullets: [],
    particles: [],
  };

  return gameState;
}

function gameLoop(gameState) {
  let shipx = gameState.screen.width / 2;
  let shipy = gameState.screen.height / 2;

  if (!gameState) {
    return;
  } else {
    // Next set of asteroids
    if (!gameState.asteroids.length) {
      let count = gameState.asteroidCount + 1;
      gameState.asteroidCount = count;
      generateAsteroids(count, gameState);
    }
  }

  checkCollisionsWith(gameState.bullets, gameState.asteroids, gameState);
  if (
    checkCollisionsWith(gameState.ship, gameState.asteroids, gameState)
  ) {
    // Ship collided with asteroid, game over
    gameState.ship = [];
    return false;
    // return true;
  }

  updateObjects(gameState.particles, "particles", gameState);
  updateObjects(gameState.asteroids, "asteroids", gameState);
  updateObjects(gameState.bullets, "bullets", gameState);
  updateObjects(gameState.ship, "ship", gameState);

  if (gameState.ship.length === 0) {
    return false;
  } else {
    return true
  }
  // No ship collision, continue game
  
}

function updateObjects(items, group, gameState) {
  let index = 0;
  for (let item of items) {
    if (item.delete) {
      gameState[group].splice(index, 1);
    } else {
      items[index].render(gameState);
    }
    index++;
  }
}

function addScore(points, gameState) {
  gameState.currentScore = gameState.currentScore + points;
}

function createObject(item, group, gameState) {
  gameState[group].push(item);
}

function generateAsteroids(howMany, gameState) {
  // eslint-disable-next-line
  //   let asteroids = [];
  let ship = gameState.ship[0];
  let shipx = gameState.screen.width / 2;
  let shipy = gameState.screen.height / 2;

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
          gameState.screen.width,
          shipx - 200,
          shipx + 200
        ),
        y: randomNumBetweenExcluding(
          0,
          gameState.screen.height,
          shipy - 200,
          shipy + 200
        ),
      },
      create: createObject.bind(this),
      addScore: addScore.bind(this),
    });
    createObject(asteroid, "asteroids", gameState);
  }
}

function checkCollisionsWith(items1, items2, gameState) {
  var a = items1.length - 1;
  var b;
  for (a; a > -1; --a) {
    b = items2.length - 1;
    for (b; b > -1; --b) {
      var item1 = items1[a];
      var item2 = items2[b];
      if (checkCollision(item1, item2)) {
        item1.destroy(gameState);
        item2.destroy(gameState);
        return true;
      }
    }
  }
  return false;
}

// TODO: Make this more forgiving for ships
function checkCollision(obj1, obj2) {
  var vx = obj1.position.x - obj2.position.x;
  var vy = obj1.position.y - obj2.position.y;
  var length = Math.sqrt(vx * vx + vy * vy);
  if (length < obj1.radius + obj2.radius) {
    return true;
  }
  return false;
}

function gameOver(gameState) {
  // gameState.keys = {
  //   left: 0,
  //   right: 0,
  //   up: 0,
  //   down: 0,
  //   space: 0,
  // };
}
