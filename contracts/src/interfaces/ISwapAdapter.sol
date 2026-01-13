// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISwapAdapter {
    function quoteExactIn(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut);
    function swapExactIn(address tokenIn, uint256 amountIn, uint256 minOut, address to) external returns (uint256 amountOut);
}
