// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {Ownable} from "./libraries/Ownable.sol";
import {ReentrancyGuard} from "./libraries/ReentrancyGuard.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";

contract CoreVirtualReservePool is Ownable, ReentrancyGuard {
    using TransferHelper for IERC20;

    uint256 public constant BPS = 10_000;

    IERC20 public immutable rwa;
    IERC20 public immutable stable;

    address public router;
    uint256 public vRwa;
    uint256 public vStable;
    uint256 public feeBps;
    bool public virtualsInitialized;

    mapping(address => bool) public suppliers;

    event RouterUpdated(address indexed router);
    event VirtualReservesUpdated(uint256 vRwa, uint256 vStable);
    event FeeUpdated(uint256 feeBps);
    event SupplierUpdated(address indexed supplier, bool enabled);
    event LiquidityAdded(address indexed provider, uint256 rwaIn, uint256 stableIn);
    event LiquidityRemoved(address indexed provider, uint256 rwaOut, uint256 stableOut);
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        uint256 amountInUsed,
        address indexed tokenOut,
        uint256 amountOutFilled,
        uint256 feePaid
    );

    modifier onlyRouter() {
        require(msg.sender == router, "NOT_ROUTER");
        _;
    }

    constructor(
        IERC20 _rwa,
        IERC20 _stable,
        address _router,
        uint256 _feeBps,
        uint256 _vRwa,
        uint256 _vStable
    ) {
        require(address(_rwa) != address(0) && address(_stable) != address(0), "ZERO_TOKEN");
        require(_feeBps < BPS, "FEE_TOO_HIGH");
        rwa = _rwa;
        stable = _stable;
        router = _router;
        feeBps = _feeBps;
        vRwa = _vRwa;
        vStable = _vStable;
        if (_vRwa > 0 || _vStable > 0) {
            virtualsInitialized = true;
        }
    }

    function setRouter(address _router) external onlyOwner {
        require(_router != address(0), "ZERO_ADDRESS");
        router = _router;
        emit RouterUpdated(_router);
    }

    function setVirtualReserves(uint256 _vRwa, uint256 _vStable) external {
        if (virtualsInitialized) {
            require(msg.sender == owner, "NOT_OWNER");
        } else {
            virtualsInitialized = true;
        }
        vRwa = _vRwa;
        vStable = _vStable;
        emit VirtualReservesUpdated(_vRwa, _vStable);
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps < BPS, "FEE_TOO_HIGH");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    function setSupplier(address supplier, bool enabled) external onlyOwner {
        suppliers[supplier] = enabled;
        emit SupplierUpdated(supplier, enabled);
    }

    function getRealReserves() public view returns (uint256 realRwa, uint256 realStable) {
        realRwa = rwa.balanceOf(address(this));
        realStable = stable.balanceOf(address(this));
    }

    function getVirtualReserves() external view returns (uint256, uint256) {
        return (vRwa, vStable);
    }

    function getEffectiveReserves() public view returns (uint256 eRwa, uint256 eStable) {
        (uint256 realRwa, uint256 realStable) = getRealReserves();
        eRwa = realRwa + vRwa;
        eStable = realStable + vStable;
    }

    function quoteExactIn(address tokenIn, uint256 amountIn)
        external
        view
        returns (uint256 amountOut, uint256 maxFillOut, uint256 priceImpactBps)
    {
        require(amountIn > 0, "ZERO_AMOUNT");
        (uint256 eRwa, uint256 eStable) = getEffectiveReserves();
        (uint256 realRwa, uint256 realStable) = getRealReserves();

        if (tokenIn == address(stable)) {
            (amountOut, priceImpactBps) = _getAmountOut(amountIn, eStable, eRwa);
            maxFillOut = _min(amountOut, realRwa);
        } else if (tokenIn == address(rwa)) {
            (amountOut, priceImpactBps) = _getAmountOut(amountIn, eRwa, eStable);
            maxFillOut = _min(amountOut, realStable);
        } else {
            revert("UNSUPPORTED_TOKEN");
        }
    }

    function addLiquidity(uint256 rwaAmount, uint256 stableAmount) external nonReentrant {
        require(rwaAmount > 0 || stableAmount > 0, "ZERO_LIQUIDITY");

        if (rwaAmount > 0) {
            rwa.safeTransferFrom(msg.sender, address(this), rwaAmount);
        }
        if (stableAmount > 0) {
            stable.safeTransferFrom(msg.sender, address(this), stableAmount);
        }

        emit LiquidityAdded(msg.sender, rwaAmount, stableAmount);
    }

    function removeLiquidity(uint256 rwaAmount, uint256 stableAmount, address to) external nonReentrant {
        require(suppliers[msg.sender], "NOT_SUPPLIER");
        require(to != address(0), "ZERO_ADDRESS");
        require(rwaAmount > 0 || stableAmount > 0, "ZERO_LIQUIDITY");

        if (rwaAmount > 0) {
            rwa.safeTransfer(to, rwaAmount);
        }
        if (stableAmount > 0) {
            stable.safeTransfer(to, stableAmount);
        }

        emit LiquidityRemoved(msg.sender, rwaAmount, stableAmount);
    }

    function swapExactIn(address tokenIn, uint256 amountIn, uint256 minOut, address to)
        external
        onlyRouter
        nonReentrant
        returns (uint256 amountOutFilled, uint256 amountInUsed)
    {
        require(amountIn > 0, "ZERO_AMOUNT");
        require(to != address(0), "ZERO_ADDRESS");

        (uint256 eRwa, uint256 eStable) = getEffectiveReserves();
        (uint256 realRwa, uint256 realStable) = getRealReserves();

        if (tokenIn == address(stable)) {
            (uint256 amountOutQuote,) = _getAmountOut(amountIn, eStable, eRwa);
            uint256 maxFillOut = _min(amountOutQuote, realRwa);
            require(maxFillOut > 0, "NO_LIQUIDITY");

            if (amountOutQuote > realRwa) {
                amountInUsed = _getAmountInForExactOut(maxFillOut, eStable, eRwa);
                require(amountInUsed <= amountIn, "INSUFFICIENT_IN");
                amountOutFilled = maxFillOut;
            } else {
                amountInUsed = amountIn;
                amountOutFilled = amountOutQuote;
            }

            require(amountOutFilled >= minOut, "SLIPPAGE");
            stable.safeTransferFrom(msg.sender, address(this), amountInUsed);
            rwa.safeTransfer(to, amountOutFilled);
        } else if (tokenIn == address(rwa)) {
            (uint256 amountOutQuote,) = _getAmountOut(amountIn, eRwa, eStable);
            uint256 maxFillOut = _min(amountOutQuote, realStable);
            require(maxFillOut > 0, "NO_LIQUIDITY");

            if (amountOutQuote > realStable) {
                amountInUsed = _getAmountInForExactOut(maxFillOut, eRwa, eStable);
                require(amountInUsed <= amountIn, "INSUFFICIENT_IN");
                amountOutFilled = maxFillOut;
            } else {
                amountInUsed = amountIn;
                amountOutFilled = amountOutQuote;
            }

            require(amountOutFilled >= minOut, "SLIPPAGE");
            rwa.safeTransferFrom(msg.sender, address(this), amountInUsed);
            stable.safeTransfer(to, amountOutFilled);
        } else {
            revert("UNSUPPORTED_TOKEN");
        }

        uint256 feePaid = (amountInUsed * feeBps) / BPS;
        emit SwapExecuted(to, tokenIn, amountInUsed, tokenIn == address(stable) ? address(rwa) : address(stable), amountOutFilled, feePaid);
    }

    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        internal
        view
        returns (uint256 amountOut, uint256 priceImpactBps)
    {
        require(reserveIn > 0 && reserveOut > 0, "EMPTY_POOL");
        uint256 amountInMinusFee = (amountIn * (BPS - feeBps)) / BPS;
        uint256 k = reserveIn * reserveOut;
        uint256 newReserveIn = reserveIn + amountInMinusFee;
        uint256 newReserveOut = k / newReserveIn;
        amountOut = reserveOut - newReserveOut;

        uint256 spotPrice = (reserveIn * 1e18) / reserveOut;
        uint256 execPrice = amountOut > 0 ? (amountInMinusFee * 1e18) / amountOut : 0;
        if (execPrice > spotPrice && spotPrice > 0) {
            priceImpactBps = ((execPrice - spotPrice) * BPS) / spotPrice;
        } else {
            priceImpactBps = 0;
        }
    }

    function _getAmountInForExactOut(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)
        internal
        view
        returns (uint256 amountIn)
    {
        require(amountOut > 0 && amountOut < reserveOut, "INVALID_OUT");
        uint256 k = reserveIn * reserveOut;
        uint256 newReserveOut = reserveOut - amountOut;
        uint256 newReserveIn = k / newReserveOut;
        uint256 amountInMinusFee = newReserveIn - reserveIn;
        uint256 denom = BPS - feeBps;
        amountIn = (amountInMinusFee * BPS + denom - 1) / denom;
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
