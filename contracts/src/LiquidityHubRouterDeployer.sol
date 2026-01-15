// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CoreVirtualReservePool} from "./CoreVirtualReservePool.sol";
import {ReservationManager} from "./ReservationManager.sol";
import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";

contract LiquidityHubRouterDeployer {
    function deployRouter(
        CoreVirtualReservePool core,
        ReservationManager reservations,
        address owner
    ) external returns (LiquidityHubRouter router) {
        require(owner != address(0), "ZERO_OWNER");

        router = new LiquidityHubRouter(core, reservations);
        router.transferOwnership(owner);
    }
}
