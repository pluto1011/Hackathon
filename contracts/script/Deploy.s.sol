// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {LiquidityHubRouter} from "../src/LiquidityHubRouter.sol";
import {LiquidityHubFactory} from "../src/LiquidityHubFactory.sol";
import {MockSwapAdapter} from "../src/MockSwapAdapter.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {CoreDeployer} from "../src/CoreDeployer.sol";
import {ReservationManagerDeployer} from "../src/ReservationManagerDeployer.sol";
import {LiquidityHubRouterDeployer} from "../src/LiquidityHubRouterDeployer.sol";
import {DerivedSpotPoolFactoryDeployer} from "../src/DerivedSpotPoolFactoryDeployer.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MockERC20 stable = new MockERC20("Mock USD", "mUSD", 18);
        MockERC20 rwa = new MockERC20("Mock RWA", "mRWA", 18);
        MockERC20 weth = new MockERC20("Wrapped ETH", "WETH", 18);

        CoreDeployer coreDeployer = new CoreDeployer();
        ReservationManagerDeployer reservationDeployer = new ReservationManagerDeployer();
        LiquidityHubRouterDeployer routerDeployer = new LiquidityHubRouterDeployer();
        DerivedSpotPoolFactoryDeployer derivedFactoryDeployer = new DerivedSpotPoolFactoryDeployer();

        LiquidityHubFactory hubFactory = new LiquidityHubFactory(
            coreDeployer,
            reservationDeployer,
            routerDeployer,
            derivedFactoryDeployer
        );

        stable.mint(msg.sender, 1_000_000 ether);
        rwa.mint(msg.sender, 100_000 ether);
        stable.approve(address(hubFactory), 1_000_000 ether);
        rwa.approve(address(hubFactory), 100_000 ether);

        LiquidityHubFactory.HubParams memory params = LiquidityHubFactory.HubParams({
            rwa: rwa,
            stable: stable,
            feeBps: 30,
            maxPriceMoveBps: 0,
            vRwa: 0,
            vStable: 0
        });

        (, , address routerAddr, ) = hubFactory.createHubAndSeed(
            params,
            100_000 ether,
            1_000_000 ether
        );
        LiquidityHubRouter router = LiquidityHubRouter(routerAddr);

        MockSwapAdapter adapter = new MockSwapAdapter(stable);
        adapter.setRate(address(weth), 1_000 ether);

        router.setAdapter(address(weth), address(adapter), true);

        vm.stopBroadcast();
    }
}
