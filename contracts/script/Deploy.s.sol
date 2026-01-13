// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {CoreVirtualReservePool} from "../src/CoreVirtualReservePool.sol";
import {ReservationManager} from "../src/ReservationManager.sol";
import {LiquidityHubRouter} from "../src/LiquidityHubRouter.sol";
import {DerivedSpotPoolFactory} from "../src/DerivedSpotPoolFactory.sol";
import {MockSwapAdapter} from "../src/MockSwapAdapter.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MockERC20 stable = new MockERC20("Mock USD", "mUSD", 18);
        MockERC20 rwa = new MockERC20("Mock RWA", "mRWA", 18);
        MockERC20 weth = new MockERC20("Wrapped ETH", "WETH", 18);

        CoreVirtualReservePool core = new CoreVirtualReservePool(
            rwa,
            stable,
            address(0),
            30,
            0,
            0
        );
        ReservationManager reservations = new ReservationManager(stable, address(0));
        LiquidityHubRouter router = new LiquidityHubRouter(core, reservations);

        core.setRouter(address(router));
        reservations.setRouter(address(router));

        DerivedSpotPoolFactory factory = new DerivedSpotPoolFactory(router);

        MockSwapAdapter adapter = new MockSwapAdapter(stable);
        adapter.setRate(address(weth), 1_000 ether);

        router.setAdapter(address(weth), address(adapter), true);

        core.setSupplier(msg.sender, true);
        stable.mint(msg.sender, 1_000_000 ether);
        rwa.mint(msg.sender, 100_000 ether);
        stable.approve(address(core), 1_000_000 ether);
        rwa.approve(address(core), 100_000 ether);
        core.addLiquidity(100_000 ether, 1_000_000 ether);

        vm.stopBroadcast();
    }
}
