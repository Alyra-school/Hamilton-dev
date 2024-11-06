// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract SimpleStorage {
    uint256 private myNumber;

    function setMyNumber(uint256 _myNumber) external {
        myNumber = _myNumber;
    }

    function getMyNumber() external view returns(uint256) {
        return myNumber;
    }


}
