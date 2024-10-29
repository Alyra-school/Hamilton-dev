// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CAT is ERC20 {

    constructor() ERC20("Consulting Alyra Token", "CAT") {
        _mint(msg.sender, 10000 * 10 ** 18);
    }

    function alyraFaucet() external {
        _mint(msg.sender, 100 * 10 ** 18 - balanceOf(msg.sender));
    }
    
}
