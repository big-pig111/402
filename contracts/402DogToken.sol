// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// NOTE: Solidity identifiers cannot start with a digit, so the contract
// class name uses Dog402Token while the ERC20 name/symbol remain 402dog/402DOG.
contract Dog402Token is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    uint256 public constant MINT_AMOUNT = 100 * 10**18;
    address public immutable FACILITATOR;

    constructor(address facilitator) ERC20("402dog", "402DOG") {
        FACILITATOR = facilitator;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        if (facilitator != address(0)) {
            _grantRole(MINTER_ROLE, facilitator);
        }
    }

    function mint(address to) external {
        require(hasRole(MINTER_ROLE, msg.sender), "Not minter");
        _mint(to, MINT_AMOUNT);
    }
}
