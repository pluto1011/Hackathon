// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {Ownable} from "./libraries/Ownable.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";

contract MockSwapAdapter is Ownable {
    using TransferHelper for IERC20;

    IERC20 public immutable stable;
    mapping(address => uint256) public rateToStable;

    event RateUpdated(address indexed tokenIn, uint256 rate);

    constructor(IERC20 _stable) {
        require(address(_stable) != address(0), "ZERO_TOKEN");
        stable = _stable;
    }

    function setRate(address tokenIn, uint256 rate) external onlyOwner {
        require(tokenIn != address(0), "ZERO_TOKEN");
        require(rate > 0, "ZERO_RATE");
        rateToStable[tokenIn] = rate;
        emit RateUpdated(tokenIn, rate);
    }

    function quoteExactIn(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        uint256 rate = rateToStable[tokenIn];
        require(rate > 0, "NO_RATE");
        amountOut = (amountIn * rate) / 1e18;
    }

    function swapExactIn(address tokenIn, uint256 amountIn, uint256 minOut, address to)
        external
        returns (uint256 amountOut)
    {
        require(to != address(0), "ZERO_ADDRESS");
        uint256 rate = rateToStable[tokenIn];
        require(rate > 0, "NO_RATE");

        amountOut = (amountIn * rate) / 1e18;
        require(amountOut >= minOut, "SLIPPAGE");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        stable.safeTransfer(to, amountOut);
    }
}
