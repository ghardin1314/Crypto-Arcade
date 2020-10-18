const io = require("socket.io")();
const socketioJwt = require("socketio-jwt");
require("dotenv").config();
const { createGameState, gameLoop, createInitialShip } = require("./game");
const { FRAME_RATE } = require("./constants");
const { v4: uuidv4 } = require("uuid");
const AstroidsContract = require("./contracts/AstroidsContract.json");

const Web3 = require("web3");

var instance = null;
var client = null;

let web3 = new Web3(process.env.NODE_ADDRESS);
web3.eth.net
  .getId()
  .then((res) => {
    const networkId = res;
    const deployedNetwork = AstroidsContract.networks[networkId];
    instance = new web3.eth.Contract(
      AstroidsContract.abi,
      deployedNetwork && deployedNetwork.address
    );
  })
  .catch(console.log);

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

const state = {};
const clientRooms = {};

io.on(
  "connection",
  socketioJwt.authorize({
    secret: process.env.SECRET_KEY,
    timeout: 15000,
  })
).on("authenticated", (client) => {
  // TODO: add authentication before allowing connection

  var jwt = client.decoded_token;

  let roomName = uuidv4();
  clientRooms[client.id] = roomName;
  state[roomName] = createGameState();
  client.emit("gameCode", roomName);

  client.join(roomName);

  state[roomName].i = 0;

  startGameInterval(roomName, jwt);

  client.on("keydown", handleKeydown);
  client.on("resize", handleResize);
  client.on("startGame", handleStartGame);
  client.on("disconnect", handleDisconnect);

  function handleDisconnect() {
    // Send score to smart contract

    const roomName = clientRooms[client.id];
    clearInterval(state[roomName].intervalId);
  }

  function handleStartGame() {
    const roomName = clientRooms[client.id];
    // add ship here
    createInitialShip(state[roomName]);
  }

  function handleResize(screen) {
    const roomName = clientRooms[client.id];

    if (!roomName) {
      return;
    }
    state[roomName].screen = screen;
  }

  function handleKeydown(keyCode, value) {
    const roomName = clientRooms[client.id];

    if (!roomName) {
      return;
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.log(e);
      return;
    }
    let keys = state[roomName].keys;
    if (keyCode === KEY.LEFT || keyCode === KEY.A) keys.left = value;
    if (keyCode === KEY.RIGHT || keyCode === KEY.D) keys.right = value;
    if (keyCode === KEY.UP || keyCode === KEY.W) keys.up = value;
    if (keyCode === KEY.SPACE) keys.space = value;
    state[roomName].keys = keys;
  }
});

function startGameInterval(roomName, jwt) {
  state[roomName].intervalId = setInterval(() => {
    const inGame = gameLoop(state[roomName]);
    if (inGame) {
      emitGameState(roomName, state[roomName]);
    } else {
      // Keep emiting for a few seconds to show death
      state[roomName].i++;
      emitGameState(roomName, state[roomName]);
      if (state[roomName].i > 1 * FRAME_RATE) {
        emitGameOver(roomName, state[roomName], jwt);
        clearInterval(state[roomName].intervalId);
      }
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
}

async function emitGameOver(roomName, state, jwt) {
  io.sockets.in(roomName).emit("gameOver", JSON.stringify(state));

  const createScore = instance.methods.createScore(
    state.currentScore,
    web3.utils.fromAscii(jwt.name),
    jwt.sub
  );

  encodedABI = createScore.encodeABI();

  var nonce = await web3.eth.getTransactionCount(
    process.env.ACCOUNT,
    "pending"
  );

  const tx = {
    from: process.env.ACCOUNT,
    to: process.env.CONTRACT_ADDRESS,
    data: encodedABI,
    gas: 2000000,
    nonce: nonce,
  };

  web3.eth.accounts
    .signTransaction(tx, process.env.PRIVATE_KEY)
    .then((signed) => {
      var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
      nonce = nonce + 1;
      tran.on("confirmation", (confirmationNumber, receipt) => {
        // console.log("confirmation: " + confirmationNumber);
      });

      tran.on("transactionHash", (hash) => {
        // console.log("hash");
        // console.log(hash);
      });

      tran.on("receipt", (receipt) => {
        // console.log("reciept");
        // console.log(receipt);
      });

      tran.on("error", console.error);
    });
}

io.listen(8080);
