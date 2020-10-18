// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.4.22 <0.7.0;

import "./HelperContract.sol";
import "./openzepplin/Ownable.sol";

contract AstroidsContract is HelperContract {
    // struct Score {
    //     uint256 score;
    //     string userName;
    //     address account;
    //     uint256 dateTime;
    // }

    // Update later with better weights

    uint256 public gameCost = 1000000000000000 wei;

    uint256 private devBudget = 0 ether;
    uint256 public devCut = 10; // %

    uint256 public lastPayoutEvent = now;

    Score[] public MonthTopScores;

    mapping(address => uint256) numTokens;

    function updateGameCost(uint256 _newCost) external onlyOwner {
        require(MonthTopScores.length == 0);
        gameCost = _newCost;
    }

    function purchaseTensOfTokens(uint256 _tensOfTokens) external payable {
        require(msg.value == gameCost * _tensOfTokens * 10);

        numTokens[msg.sender] = numTokens[msg.sender] + _tensOfTokens * 10;
    }

    function getNumTokens(address _address) external view returns (uint256) {
        return numTokens[_address];
    }

    function getPot() external view returns (uint256) {
        // pot = numGames * gameCost - what is paid to devs
        return ((MonthTopScores.length * gameCost) * (100 - devCut)) / 100;
    }

    event timeToPayout();

    event newScore(address indexed _from, uint256 _numTokens);

    function createScore(
        uint256 _score,
        bytes32 _userName,
        address payable _account
    ) external onlyOwner {
        require(numTokens[_account] > 0);

        MonthTopScores.push(Score(_score, _userName, _account, now));

        numTokens[_account]--;

        emit newScore(_account, numTokens[_account]);

        if ((lastPayoutEvent - now) / 60 / 60 / 24 > 30) {
            emit timeToPayout();
        }
    }

    function payDevs() external {
        address payable _owner = address(uint160(owner()));
        _owner.transfer(devBudget);
        devBudget = 0;
    }

    function updateDevCut(uint256 _newCut) external onlyOwner {
        require(_newCut < devCut);

        devCut = _newCut;
    }

    

    event newPayout();

    function payout() external {
        // 30 days betweem payouts()
        require(now - lastPayoutEvent > 86400);
        _payoutMonthTopScores();
    }

    function _payoutMonthTopScores() internal {
        Score[] memory _rankedTopScore = MonthTopScores;

        _rankedTopScore = super.sort(_rankedTopScore);

        uint256 numGames = _rankedTopScore.length;

        uint256 pot = numGames * gameCost;

        require( pot + devBudget <= address(this).balance);

        // Subtract dev cut

        devBudget = devBudget + (pot * devCut) / 100;

        pot = (pot * (100 - devCut)) / 100;

        uint256 j = (_rankedTopScore.length * 50) / 100;
        uint256 sum = (j * (j + 1) * (2 * j + 1)) / 6;

        for (uint256 i = 0; i < j; i++) {
            _rankedTopScore[i].account.transfer(
                (pot * (j - i) * (j - i)) / sum
            );
        }

        // TODO: fill in new payout data to emit
        emit newPayout();

        // clear all scores
        _clearMonthScores();
    }

    function _clearMonthScores() private {
        delete MonthTopScores;
    }

    function topscoresLength() public view returns (uint256) {
        return MonthTopScores.length;
    }

    function getDevBudget() public view onlyOwner returns (uint256) {
        return (devBudget);
    }
}
