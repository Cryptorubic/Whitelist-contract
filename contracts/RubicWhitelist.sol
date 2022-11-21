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
    function removeOperators(address[] calldata _operators) external onlyOperator {
        uint256 length = _operators.length;
        for (uint256 i; i < length; ) {
            if (_operators[i] == msg.sender) revert CannotRemoveYourself();
            whitelistedOperators.remove(_operators[i]);
            unchecked {
                ++i;
            }
        }
    }

    function getAvailableOperators() external view returns (address[] memory) {
        return whitelistedOperators.values();
    }

    function isOperator(address _operator) external view returns (bool) {
        return whitelistedOperators.contains(_operator);
    }

    /**
     * @dev Appends new whitelisted cross chain addresses
     * @param _crossChains cross chain addresses to add
     */
    function addCrossChains(address[] calldata _crossChains) external onlyOperator {
        uint256 length = _crossChains.length;
        for (uint256 i; i < length; ) {
            address _crossChain = _crossChains[i];
            if (_crossChain == address(0)) {
                revert ZeroAddress();
            }
            whitelistedCrossChains.add(_crossChain);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Removes existing whitelisted cross chain addesses
     * @param _crossChains cross chain addresses to remove
     */
    function removeCrossChains(address[] calldata _crossChains) external onlyOperator {
        uint256 length = _crossChains.length;
        for (uint256 i; i < length; ) {
            whitelistedCrossChains.remove(_crossChains[i]);
            unchecked {
                ++i;
            }
        }
    }

    function getAvailableCrossChains() external view returns (address[] memory) {
        return whitelistedCrossChains.values();
    }

    function isWhitelistedCrossChain(address _crossChain) external view returns (bool) {
        return whitelistedCrossChains.contains(_crossChain);
    }

    /**
     * @dev Appends new whitelisted DEX addresses
     * @param _dexs DEX addresses to add
     */
    function addDEXs(address[] calldata _dexs) external onlyOperator {
        uint256 length = _dexs.length;
        for (uint256 i; i < length; ) {
            address _dex = _dexs[i];
            if (_dex == address(0)) {
                revert ZeroAddress();
            }
            whitelistedDEXs.add(_dex);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Removes existing whitelisted DEX addesses
     * @param _dexs DEX addresses to remove
     */
    function removeDEXs(address[] calldata _dexs) external onlyOperator {
        uint256 length = _dexs.length;
        for (uint256 i; i < length; ) {
            whitelistedDEXs.remove(_dexs[i]);
            unchecked {
                ++i;
            }
        }
    }

    function getAvailableDEXs() external view returns (address[] memory) {
        return whitelistedDEXs.values();
    }

    function isWhitelistedDEX(address _dex) external view returns (bool) {
        return whitelistedDEXs.contains(_dex);
    }

    /**
     * @dev Appends new whitelisted any router addresses of Multichain
     * @param _anyRouters any router addresses to add
     */
    function addAnyRouters(address[] calldata _anyRouters) external onlyOperator {
        uint256 length = _anyRouters.length;
        for (uint256 i; i < length; ) {
            address _anyRouter = _anyRouters[i];
            if (_anyRouter == address(0)) {
                revert ZeroAddress();
            }
            whitelistedAnyRouters.add(_anyRouter);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Removes existing whitelisted any router addesses of Multichain
     * @param _anyRouters any router addresses to remove
     */
    function removeAnyRouters(address[] calldata _anyRouters) external onlyOperator {
        uint256 length = _anyRouters.length;
        for (uint256 i; i < length; ) {
            whitelistedAnyRouters.remove(_anyRouters[i]);
            unchecked {
                ++i;
            }
        }
    }

    function getAvailableAnyRouters() external view returns (address[] memory) {
        return whitelistedAnyRouters.values();
    }

    function isWhitelistedAnyRouter(address _anyRouter) external view returns (bool) {
        return whitelistedAnyRouters.contains(_anyRouter);
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
