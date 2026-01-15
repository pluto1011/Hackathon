// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {CoreVirtualReservePool} from "./CoreVirtualReservePool.sol";

contract CoreDeployer {
    function deployCore(
        IERC20 rwa,
        IERC20 stable,
        uint256 feeBps,
        address creator,
        address liquiditySeeder,
        address owner
    ) external returns (CoreVirtualReservePool core) {
        require(owner != address(0), "ZERO_OWNER");

        core = new CoreVirtualReservePool(
            rwa,
            stable,
            address(0),
            feeBps,
            0,
            0,
            creator,
            liquiditySeeder
        );
        core.transferOwnership(owner);
    }
}
