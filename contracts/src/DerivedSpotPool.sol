// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";

contract DerivedSpotPool {
    address public baseToken;
    LiquidityHubRouter public router;
    bool public initialized;

    event Initialized(address indexed baseToken, address indexed router);

    constructor() {
        initialized = true;
    }

    function initialize(address _baseToken, LiquidityHubRouter _router) external {
        require(!initialized, "ALREADY_INIT");
        require(_baseToken != address(0), "ZERO_TOKEN");
        require(address(_router) != address(0), "ZERO_ROUTER");
        baseToken = _baseToken;
        router = _router;
        initialized = true;
        emit Initialized(_baseToken, address(_router));
    }

    function swapExactIn(uint256 amountIn, uint256 minOut, address to, bool allowReserve)
        external
        returns (uint256 filledRwa, uint256 reservedStable)
    {
        require(initialized, "NOT_INITIALIZED");
        return router.swapToRwaExactIn(baseToken, amountIn, minOut, to, allowReserve);
    }

    function quoteExactIn(uint256 amountIn)
        external
        view
        returns (uint256 rwaOutQuote, uint256 rwaOutCap, uint256 stableAmount, bool willReserve)
    {
        require(initialized, "NOT_INITIALIZED");
        return router.quoteToRwaExactIn(baseToken, amountIn);
    }
}
