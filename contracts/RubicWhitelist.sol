// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract RubicWhitelist is Initializable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // AddressSet of whitelisted addresses
    EnumerableSetUpgradeable.AddressSet internal whitelistedOperators;

    error NotAnOperator();
    error ZeroAddress();
    error CannotRemoveYourself();
    error CannotAddYourself();

    EnumerableSetUpgradeable.AddressSet internal whitelistedCrossChains;
    EnumerableSetUpgradeable.AddressSet internal whitelistedDEXs;
    EnumerableSetUpgradeable.AddressSet internal whitelistedAnyRouters;

    // reference to https://github.com/OpenZeppelin/openzeppelin-contracts/pull/3347/
    modifier onlyOperator() {
        checkIsOperator();
        _;
    }

    function checkIsOperator() internal view {
        if (!whitelistedOperators.contains(msg.sender)) revert NotAnOperator();
    }

    function initialize() external initializer {
        whitelistedOperators.add(msg.sender);
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
            if (_operators[i] == msg.sender) revert CannotAddYourself();
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
            if (_operators[i] == msg.sender) revert CannotRemoveYourself();
            whitelistedOperators.remove(_operators[i]);
            unchecked {
                ++i;
            }
        }
    }

    // TODO add+remove

    function getAvailableOperators() external view returns (address[] memory) {
        return whitelistedOperators.values();
    }

    function sendToken(address _token, uint256 _amount, address _receiver) internal {
        if (_token == address(0)) {
            AddressUpgradeable.sendValue(payable(_receiver), _amount);
        } else {
            IERC20Upgradeable(_token).safeTransfer(_receiver, _amount);
        }
    }

    function sweepTokens(address _token, uint256 _amount) external onlyOperator {
        sendToken(_token, _amount, msg.sender);
    }

    /**
     * @dev Plain fallback function
     */
    fallback() external {}
}
