// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '../RubicWhitelist.sol';

contract WhitelistMock is RubicWhitelist {
    constructor(address[] memory _operators, address _admin) {
        initialize(_operators, _admin);
    }
}
