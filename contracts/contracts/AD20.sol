// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AD20 is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 Million Tokens

    constructor() ERC20("Attestor Token", "AD20") {
        _mint(msg.sender, INITIAL_SUPPLY); // Mint all tokens to the deployer
    }
}
