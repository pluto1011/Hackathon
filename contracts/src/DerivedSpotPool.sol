// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LiquidityHubRouter} from "./LiquidityHubRouter.sol";

contract DerivedSpotPool {
    address public immutable baseToken;
    LiquidityHubRouter public immutable router;

    constructor(address _baseToken, LiquidityHubRouter _router) {
        require(_baseToken != address(0), "ZERO_TOKEN");
        baseToken = _baseToken;
        router = _router;
    }

    function swapExactIn(uint256 amountIn, uint256 minOut, address to, bool allowReserve)
        external
        returns (uint256 filledRwa, uint256 reservedStable)
    {
        return router.swapToRwaExactIn(baseToken, amountIn, minOut, to, allowReserve);
    }

    function quoteExactIn(uint256 amountIn)
        external
        view
        returns (uint256 rwaOutQuote, uint256 rwaOutCap, uint256 stableAmount, bool willReserve)
    {
        return router.quoteToRwaExactIn(baseToken, amountIn);
    }
}
