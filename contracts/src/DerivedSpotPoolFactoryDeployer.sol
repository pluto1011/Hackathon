// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";
import {DerivedSpotPoolFactory} from "./DerivedSpotPoolFactory.sol";

contract DerivedSpotPoolFactoryDeployer {
    function deployDerivedSpotPoolFactory(LiquidityHubRouter router, address owner)
        external
        returns (DerivedSpotPoolFactory factory)
    {
        require(owner != address(0), "ZERO_OWNER");

        factory = new DerivedSpotPoolFactory(router);
        factory.transferOwnership(owner);
    }
}
