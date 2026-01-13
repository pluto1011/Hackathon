// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "./libraries/Ownable.sol";
import {DerivedSpotPool} from "./DerivedSpotPool.sol";
import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";

contract DerivedSpotPoolFactory is Ownable {
    LiquidityHubRouter public router;

    mapping(address => address) public getDerivedPool;
    address[] public allPools;

    event DerivedPoolCreated(address indexed baseToken, address pool);

    constructor(LiquidityHubRouter _router) {
        router = _router;
    }

    function setRouter(LiquidityHubRouter _router) external onlyOwner {
        router = _router;
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }

    function createDerivedPool(address baseToken) external returns (address pool) {
        require(baseToken != address(0), "ZERO_TOKEN");
        require(getDerivedPool[baseToken] == address(0), "POOL_EXISTS");

        pool = address(new DerivedSpotPool(baseToken, router));
        getDerivedPool[baseToken] = pool;
        allPools.push(pool);

        emit DerivedPoolCreated(baseToken, pool);
    }
}
