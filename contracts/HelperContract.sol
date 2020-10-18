// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.4.22 <0.7.0;

import "./openzepplin/Ownable.sol";

contract HelperContract is Ownable {

    struct Score {
        uint256 score;
        bytes32 userName;
        address payable account;
        uint256 dateTime;
    }

    function kill() public virtual onlyOwner {
        selfdestruct(msg.sender);
    }

    // TODO: input and return correct data
    function sort(Score[] memory data) internal pure returns (Score[] memory) {
        quickSort(data, int256(0), int256(data.length - 1));
        return data;
    }

    // TODO: sort largest to smallest
    function quickSort(
        Score[] memory arr,
        int256 left,
        int256 right
    ) internal pure {
        int256 i = left;
        int256 j = right;
        if (i == j) return;
        uint256 pivot = arr[uint256(left + (right - left) / 2)].score;
        while (i <= j) {
            while (arr[uint256(i)].score > pivot) i++;
            while (pivot > arr[uint256(j)].score) j--;
            if (i <= j) {
                (arr[uint256(i)], arr[uint256(j)]) = (
                    arr[uint256(j)],
                    arr[uint256(i)]
                );
                i++;
                j--;
            }
        }
        if (left < j) quickSort(arr, left, j);
        if (i < right) quickSort(arr, i, right);
    }

    function getArraySum(uint256[] memory _array)
        public
        pure
        returns (uint256 sum_)
    {
        sum_ = 0;
        for (uint256 i = 0; i < _array.length; i++) {
            sum_ += _array[i];
        }
    }
}
