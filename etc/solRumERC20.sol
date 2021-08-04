// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RumERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 cap,
        address minter
    ) ERC20(name, symbol) {
        // send all supply to minter
        _mint(minter, cap);
    }
}
