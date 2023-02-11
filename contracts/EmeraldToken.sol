// SPDX-License-Identifier: Academic Free License v3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EmeraldToken is Ownable, ERC20 {
    constructor(uint256 amount) ERC20("Emerald", "EMD") {
        _mint(msg.sender, amount);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}
