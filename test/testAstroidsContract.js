const assert = require("assert");
const utils = require("./helpers/utils");
const AstroidsContract = artifacts.require("AstroidsContract");
const truffleAssert = require("truffle-assertions");

function getPayout(numGames, place) {
  var j = (numGames * 50) / 100;

  var sum = (j * (j + 1) * (2 * j + 1)) / 6;

  return ((j - place) * (j - place)) / sum;
}

contract("AstroidsContract", (accounts) => {
  let [alice, bob, charlie, daniel, ethan] = accounts;

  // Setup and Tear Down
  let contractInstance;
  beforeEach(async () => {
    contractInstance = await AstroidsContract.new();
  });

  afterEach(async () => {
    await contractInstance.kill();
  });
  //--------------------------------------------

  it("Should update gameCost variable", async () => {
    const newCost = 600000000000000;

    await contractInstance.updateGameCost(newCost);
    assert.strictEqual(parseInt(await contractInstance.gameCost()), newCost);
  });

  it("should throw when trying to update gameCost when games have already been played", async () => {
    const newCost = 600000000000000;

    const gameCost = await contractInstance.gameCost();
    await contractInstance.purchaseTensOfTokens(1, {
      from: bob,
      value: gameCost * 10,
    });
    await contractInstance.createScore(100, web3.utils.fromAscii("Bob"), bob, {
      from: alice,
    });

    await utils.shouldThrow(contractInstance.updateGameCost(newCost));
  });

  it("Should throw when payment is not enough", async () => {
    const gameCost = await contractInstance.gameCost();

    const transferCost = gameCost * 10;

    const failtureCost = gameCost - 1;

    await contractInstance.purchaseTensOfTokens(1, {
      from: bob,
      value: transferCost,
    });

    await utils.shouldThrow(
      contractInstance.purchaseTensOfTokens(1, {
        from: bob,
        value: failtureCost,
      })
    );
  });

  it("Add tokens to account", async () => {
    const gameCost = await contractInstance.gameCost();

    await contractInstance.purchaseTensOfTokens(2, {
      from: bob,
      value: gameCost * 10 * 2,
    });

    const numTokens = await contractInstance.getNumTokens(bob);

    assert.strictEqual(20, parseInt(numTokens));
  });

  context("with adding scores to MonthTopScores", async () => {
    it("Should emit new event when score is added", async () => {
      const gameCost = await contractInstance.gameCost();
      await contractInstance.purchaseTensOfTokens(1, {
        from: bob,
        value: gameCost * 10,
      });

      res = await contractInstance.createScore(
        100,
        web3.utils.fromAscii("Bob"),
        bob,
        { from: alice }
      );

      truffleAssert.eventEmitted(res, "newScore");
    });

    it("Should add scores to MonthTopScores", async () => {
      const gameCost = await contractInstance.gameCost();
      await contractInstance.purchaseTensOfTokens(1, {
        from: bob,
        value: gameCost * 10,
      });
      await contractInstance.createScore(
        100,
        web3.utils.fromAscii("Bob"),
        bob,
        {
          from: alice,
        }
      );
      const result = await contractInstance.MonthTopScores(0);
      assert.strictEqual(parseInt(result.score), 100);
      assert.strictEqual(result.account, bob);
      assert.strictEqual(web3.utils.hexToUtf8(result.userName), "Bob");
      // TODO: Test datetime?
    });

    it("Should clear score from MonthTopScores", async () => {
      const gameCost = await contractInstance.gameCost();

      const initialLength = await contractInstance.topscoresLength();
      assert.strictEqual(parseInt(initialLength), 0);

      await contractInstance.purchaseTensOfTokens(2, {
        from: bob,
        value: gameCost * 20,
      });

      //Create more scores from bob
      for (var i = 0; i < 20; i++) {
        await contractInstance.createScore(
          100 + i,
          web3.utils.fromAscii("Bob"),
          bob,
          { from: alice }
        );
      }

      const firstLength = await contractInstance.topscoresLength();
      assert.strictEqual(parseInt(firstLength), i);

      await contractInstance.purchaseTensOfTokens(2, {
        from: alice,
        value: gameCost * 20,
      });

      //Create second score for alice
      await contractInstance.createScore(
        300,
        web3.utils.fromAscii("Alice"),
        alice,
        { from: alice }
      );

      const secondLength = await contractInstance.topscoresLength();
      assert.strictEqual(parseInt(secondLength), i + 1);

      const newblock = await utils.advanceTimeAndBlock(60 * 60 * 24 + 1);
      await contractInstance.payout();

      const secondScore = await contractInstance.topscoresLength();
      assert.strictEqual(parseInt(secondScore), 0);
    });

    it("Should payout to top scores", async () => {
      const gameCost = await contractInstance.gameCost();
      const charlieInitialBal = await web3.eth.getBalance(charlie);
      const danielInitialBal = await web3.eth.getBalance(daniel);

      await contractInstance.purchaseTensOfTokens(10, {
        from: bob,
        value: gameCost * 100,
      });

      //Create more scores from bob
      for (var i = 0; i < 100; i++) {
        await contractInstance.createScore(
          100 + i,
          web3.utils.fromAscii("Bob"),
          bob,
          { from: alice }
        );
      }

      var purchaseResult = await contractInstance.purchaseTensOfTokens(1, {
        from: charlie,
        value: gameCost * 10,
      });

      //Create high score for charlie
      var result = await contractInstance.createScore(
        1000,
        web3.utils.fromAscii("Charlie"),
        charlie,
        { from: alice }
      );

      //Calculate transaction cost
      var purchaseCost = await utils.calcTransactionCost(purchaseResult);
      const charlieMiddleBal = await web3.eth.getBalance(charlie);
      assert.strictEqual(
        charlieInitialBal - purchaseCost - gameCost * 10,
        parseInt(charlieMiddleBal)
      );

      purchaseResult = await contractInstance.purchaseTensOfTokens(1, {
        from: daniel,
        value: gameCost * 10,
      });

      //Create second score for daniel
      await contractInstance.createScore(
        900,
        web3.utils.fromAscii("Daniel"),
        daniel,
        { from: alice }
      );

      //Calculate transaction cost
      purchaseCost = await utils.calcTransactionCost(purchaseResult);
      const danielMiddleBal = await web3.eth.getBalance(daniel);
      assert.strictEqual(
        danielInitialBal - gameCost * 10 - purchaseCost,
        parseInt(danielMiddleBal)
      );

      const numGames = parseInt(await contractInstance.topscoresLength());

      const contractBalance = await web3.eth.getBalance(
        contractInstance.address
      );

      const payoutPool = await contractInstance.getPot();

      await utils.advanceTimeAndBlock(60 * 60 * 24 + 1);
      await contractInstance.payout({ from: alice });

      const charlieFinalBal = await web3.eth.getBalance(charlie);
      const danielFinalBal = await web3.eth.getBalance(daniel);

      assert.strictEqual(
        parseInt(charlieFinalBal),
        +charlieMiddleBal + +payoutPool * getPayout(numGames, 0)
      );

      assert.strictEqual(
        parseInt(danielFinalBal),
        +danielMiddleBal + +payoutPool * getPayout(numGames, 1)
      );
    });

    it("Should throw if payout is called before a month", async () => {
      const gameCost = await contractInstance.gameCost();

      await contractInstance.purchaseTensOfTokens(1, {
        from: bob,
        value: gameCost * 10,
      });

      //Create more scores from bob
      for (var i = 0; i < 10; i++) {
        await contractInstance.createScore(
          100 + i,
          web3.utils.fromAscii("Bob"),
          bob,
          { from: alice }
        );
      }
      await utils.advanceTimeAndBlock(60 * 60 * 24 - 10000);
      await utils.shouldThrow(contractInstance.payout());
    });

    it("Should take out dev cut from winnings pot", async () => {
      //crazy high cost just to make sure logic is working without transaction costs
      const newCost = "0.05"; //eth

      await contractInstance.updateGameCost(web3.utils.toWei(newCost));

      const gameCost = await contractInstance.gameCost();

      await contractInstance.purchaseTensOfTokens(5, {
        from: bob,
        value: gameCost * 50,
      });

      //Create more scores from bob
      for (var i = 0; i < 50; i++) {
        await contractInstance.createScore(
          100 + i,
          web3.utils.fromAscii("Bob"),
          bob,
          { from: alice }
        );
      }

      var aliceInitialBal = await web3.eth.getBalance(alice);

      await utils.advanceTimeAndBlock(60 * 60 * 24 + 1);

      await contractInstance.payout({ from: daniel });

      var devPot = await contractInstance.getDevBudget();
      assert(devPot > 0);

      await contractInstance.payDevs({ from: daniel });

      var aliceFinalBal = await web3.eth.getBalance(alice);
      // aliceFinalBal = web3.utils.fromWei(aliceFinalBal);

      var summedBal = parseInt(aliceInitialBal) + parseInt(devPot);
      assert.strictEqual(parseInt(aliceFinalBal), summedBal);

      devPot = await contractInstance.getDevBudget();
      assert.strictEqual(parseFloat(devPot), 0);
    });
  });
});
