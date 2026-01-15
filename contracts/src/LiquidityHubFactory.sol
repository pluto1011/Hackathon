// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {Ownable} from "./libraries/Ownable.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";
import {CoreVirtualReservePool} from "./CoreVirtualReservePool.sol";
import {ReservationManager} from "./ReservationManager.sol";
import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";
import {DerivedSpotPoolFactory} from "./DerivedSpotPoolFactory.sol";
import {CoreDeployer} from "./CoreDeployer.sol";
import {ReservationManagerDeployer} from "./ReservationManagerDeployer.sol";
import {LiquidityHubRouterDeployer} from "./LiquidityHubRouterDeployer.sol";
import {DerivedSpotPoolFactoryDeployer} from "./DerivedSpotPoolFactoryDeployer.sol";

contract LiquidityHubFactory is Ownable {
    using TransferHelper for IERC20;

    CoreDeployer public coreDeployer;
    ReservationManagerDeployer public reservationDeployer;
    LiquidityHubRouterDeployer public routerDeployer;
    DerivedSpotPoolFactoryDeployer public derivedFactoryDeployer;

    struct HubParams {
        IERC20 rwa;
        IERC20 stable;
        uint256 feeBps;
        uint256 maxPriceMoveBps;
        uint256 vRwa;
        uint256 vStable;
    }
    event HubCreated(
        address indexed creator,
        address indexed core,
        address indexed router,
        address reservations,
        address derivedFactory
    );

    constructor(
        CoreDeployer _coreDeployer,
        ReservationManagerDeployer _reservationDeployer,
        LiquidityHubRouterDeployer _routerDeployer,
        DerivedSpotPoolFactoryDeployer _derivedFactoryDeployer
    ) {
        require(
            address(_coreDeployer) != address(0) &&
                address(_reservationDeployer) != address(0) &&
                address(_routerDeployer) != address(0) &&
                address(_derivedFactoryDeployer) != address(0),
            "ZERO_ADDRESS"
        );
        coreDeployer = _coreDeployer;
        reservationDeployer = _reservationDeployer;
        routerDeployer = _routerDeployer;
        derivedFactoryDeployer = _derivedFactoryDeployer;
    }

    function createHub(
        IERC20 rwa,
        IERC20 stable,
        uint256 feeBps,
        uint256 maxPriceMoveBps,
        uint256 vRwa,
        uint256 vStable
    )
        external
        returns (address core, address reservations, address router, address derivedFactory)
    {
        require(address(rwa) != address(0) && address(stable) != address(0), "ZERO_TOKEN");

        (
            CoreVirtualReservePool corePool,
            ReservationManager reservationManager,
            LiquidityHubRouter hubRouter,
            DerivedSpotPoolFactory poolFactory
        ) = _deployHub(rwa, stable, feeBps, msg.sender, address(0));

        _applyVirtuals(corePool, maxPriceMoveBps, vRwa, vStable);
        _transferOwnerships(corePool, reservationManager, hubRouter, poolFactory, msg.sender);

        core = address(corePool);
        reservations = address(reservationManager);
        router = address(hubRouter);
        derivedFactory = address(poolFactory);

        emit HubCreated(msg.sender, core, router, reservations, derivedFactory);
    }

    function createHubAndSeed(
        HubParams calldata params,
        uint256 rwaAmount,
        uint256 stableAmount
    )
        external
        returns (address core, address reservations, address router, address derivedFactory)
    {
        require(address(params.rwa) != address(0) && address(params.stable) != address(0), "ZERO_TOKEN");
        require(rwaAmount > 0 || stableAmount > 0, "ZERO_LIQUIDITY");

        (
            CoreVirtualReservePool corePool,
            ReservationManager reservationManager,
            LiquidityHubRouter hubRouter,
            DerivedSpotPoolFactory poolFactory
        ) = _deployHub(params.rwa, params.stable, params.feeBps, msg.sender, address(this));

        _applyVirtuals(corePool, params.maxPriceMoveBps, params.vRwa, params.vStable);
        _seedLiquidity(corePool, params.rwa, params.stable, rwaAmount, stableAmount);
        _transferOwnerships(corePool, reservationManager, hubRouter, poolFactory, msg.sender);

        core = address(corePool);
        reservations = address(reservationManager);
        router = address(hubRouter);
        derivedFactory = address(poolFactory);

        emit HubCreated(msg.sender, core, router, reservations, derivedFactory);
    }

    function _deployHub(
        IERC20 rwa,
        IERC20 stable,
        uint256 feeBps,
        address creator,
        address seeder
    )
        internal
        returns (
            CoreVirtualReservePool corePool,
            ReservationManager reservationManager,
            LiquidityHubRouter hubRouter,
            DerivedSpotPoolFactory poolFactory
        )
    {
        corePool = coreDeployer.deployCore(rwa, stable, feeBps, creator, seeder, address(this));
        reservationManager = reservationDeployer.deployReservationManager(stable, address(this));
        hubRouter = routerDeployer.deployRouter(corePool, reservationManager, address(this));
        corePool.setRouter(address(hubRouter));
        reservationManager.setRouter(address(hubRouter));

        poolFactory = derivedFactoryDeployer.deployDerivedSpotPoolFactory(hubRouter, address(this));
    }

    function _applyVirtuals(
        CoreVirtualReservePool corePool,
        uint256 maxPriceMoveBps,
        uint256 vRwa,
        uint256 vStable
    ) internal {
        if (maxPriceMoveBps > 0) {
            corePool.setMaxPriceMoveBps(maxPriceMoveBps);
        }
        if (vRwa > 0 || vStable > 0) {
            require(vRwa > 0 && vStable > 0, "INVALID_VIRTUALS");
            corePool.setVirtualReserves(vRwa, vStable);
        }
    }

    function _seedLiquidity(
        CoreVirtualReservePool corePool,
        IERC20 rwa,
        IERC20 stable,
        uint256 rwaAmount,
        uint256 stableAmount
    ) internal {
        if (rwaAmount > 0) {
            rwa.safeTransferFrom(msg.sender, address(this), rwaAmount);
            rwa.safeApprove(address(corePool), rwaAmount);
        }
        if (stableAmount > 0) {
            stable.safeTransferFrom(msg.sender, address(this), stableAmount);
            stable.safeApprove(address(corePool), stableAmount);
        }
        corePool.addLiquidity(rwaAmount, stableAmount);
    }

    function _transferOwnerships(
        CoreVirtualReservePool corePool,
        ReservationManager reservationManager,
        LiquidityHubRouter hubRouter,
        DerivedSpotPoolFactory poolFactory,
        address owner
    ) internal {
        corePool.transferOwnership(owner);
        reservationManager.transferOwnership(owner);
        hubRouter.transferOwnership(owner);
        poolFactory.transferOwnership(owner);
    }
}
