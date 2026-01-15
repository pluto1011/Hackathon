// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "./libraries/Ownable.sol";
import {DerivedSpotPool} from "./DerivedSpotPool.sol";
import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";
import {Clones} from "./libraries/Clones.sol";

contract DerivedSpotPoolFactory is Ownable {
    LiquidityHubRouter public router;
    address public implementation;

    mapping(address => address) public getDerivedPool;
    address[] public allPools;

    event DerivedPoolCreated(address indexed baseToken, address pool);
    event ImplementationUpdated(address indexed implementation);

    constructor(LiquidityHubRouter _router) {
        router = _router;
        implementation = address(new DerivedSpotPool());
        emit ImplementationUpdated(implementation);
    }

    function setRouter(LiquidityHubRouter _router) external onlyOwner {
        router = _router;
    }

    function setImplementation(address _implementation) external onlyOwner {
        require(_implementation != address(0), "ZERO_ADDRESS");
        implementation = _implementation;
        emit ImplementationUpdated(_implementation);
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }

    function createDerivedPool(address baseToken) external returns (address pool) {
        require(baseToken != address(0), "ZERO_TOKEN");
        require(getDerivedPool[baseToken] == address(0), "POOL_EXISTS");

        pool = Clones.clone(implementation);
        DerivedSpotPool(pool).initialize(baseToken, router);
        getDerivedPool[baseToken] = pool;
        allPools.push(pool);

        emit DerivedPoolCreated(baseToken, pool);
    }
}
