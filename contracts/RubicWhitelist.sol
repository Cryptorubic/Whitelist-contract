// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol';

contract RubicWhitelist {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;


    // AddressSet of whitelisted addresses
    EnumerableSetUpgradeable.AddressSet internal whitelistedOperators;

    error NotAnOperator();
    error ZeroAddress();

    // reference to https://github.com/OpenZeppelin/openzeppelin-contracts/pull/3347/
    modifier onlyOperator() {
        checkIsOperator();
        _;
    }

    function checkIsOperator() internal view {
        if (!whitelistedOperators.contains(msg.sender)) revert NotAnOperator();
    }

    /**
     * @dev Appends new whitelisted operators
     * @param _operators operators addresses to add
     */
    function addOperators(address[] calldata _operators) external onlyOperator {
        uint256 length = _operators.length;
        for (uint256 i; i < length; ) {
            address _operator = _operators[i];
            if (_operator == address(0)) {
                revert ZeroAddress();
            }
            whitelistedOperators.add(_operator);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Removes existing whitelisted operators
     * @param _operators operators addresses to remove
     */
    function removeOperators(address[] memory _operators) external onlyOperator {
        uint256 length = _operators.length;
        for (uint256 i; i < length; ) {
            whitelistedOperators.remove(_operators[i]);
            unchecked {
                ++i;
            }
        }
    }
}