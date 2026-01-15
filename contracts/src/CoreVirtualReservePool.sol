// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {Ownable} from "./libraries/Ownable.sol";
import {ReentrancyGuard} from "./libraries/ReentrancyGuard.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";

contract CoreVirtualReservePool is Ownable, ReentrancyGuard {
    using TransferHelper for IERC20;

    uint256 public constant BPS = 10_000;
    uint256 public constant POOL_DURATION = 6 hours;
    uint256 public constant MIN_INITIAL_RWA_BPS = 200;
    uint256 public constant MAX_PRICE_MOVE_BPS = 3_000;
    uint256 private constant FIXED_ONE = 1e18;

    IERC20 public immutable rwa;
    IERC20 public immutable stable;
    address public immutable creator;
    uint256 public immutable expiresAt;

    address public router;
    uint256 public vRwa;
    uint256 public vStable;
    uint256 public feeBps;
    uint256 public maxPriceMoveBps;
    bool public virtualsInitialized;
    bool public liquidityInitialized;

    event RouterUpdated(address indexed router);
    event VirtualReservesUpdated(uint256 vRwa, uint256 vStable);
    event FeeUpdated(uint256 feeBps);
    event MaxPriceMoveUpdated(uint256 maxPriceMoveBps);
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
        creator = msg.sender;
        expiresAt = block.timestamp + POOL_DURATION;
        router = _router;
        feeBps = _feeBps;
        vRwa = _vRwa;
        vStable = _vStable;
        maxPriceMoveBps = MAX_PRICE_MOVE_BPS;
    }

    function setRouter(address _router) external onlyOwner {
        require(_router != address(0), "ZERO_ADDRESS");
        router = _router;
        emit RouterUpdated(_router);
    }

    function setVirtualReserves(uint256 _vRwa, uint256 _vStable) external onlyOwner {
        require(!liquidityInitialized, "LOCKED");
        virtualsInitialized = true;
        vRwa = _vRwa;
        vStable = _vStable;
        emit VirtualReservesUpdated(_vRwa, _vStable);
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps < BPS, "FEE_TOO_HIGH");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    function setMaxPriceMoveBps(uint256 _maxPriceMoveBps) external onlyOwner {
        require(!liquidityInitialized, "LOCKED");
        require(_maxPriceMoveBps > 0 && _maxPriceMoveBps <= BPS, "INVALID_BPS");
        maxPriceMoveBps = _maxPriceMoveBps;
        emit MaxPriceMoveUpdated(_maxPriceMoveBps);
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
        require(liquidityInitialized, "NOT_INITIALIZED");
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

        bool isInit = !liquidityInitialized;
        if (isInit) {
            require(msg.sender == creator, "CREATOR_ONLY");
            uint256 minRwa = (rwa.totalSupply() * MIN_INITIAL_RWA_BPS + BPS - 1) / BPS;
            require(rwaAmount > 0, "ZERO_RWA");
            require(rwaAmount >= minRwa, "MIN_RWA");
            require(stableAmount > 0, "ZERO_STABLE");
        }

        if (rwaAmount > 0) {
            rwa.safeTransferFrom(msg.sender, address(this), rwaAmount);
        }
        if (stableAmount > 0) {
            stable.safeTransferFrom(msg.sender, address(this), stableAmount);
        }

        if (isInit) {
            liquidityInitialized = true;
            if (!virtualsInitialized) {
                (uint256 realRwa, uint256 realStable) = getRealReserves();
                (vRwa, vStable) = _calcVirtualReserves(realRwa, realStable, maxPriceMoveBps);
                virtualsInitialized = true;
                emit VirtualReservesUpdated(vRwa, vStable);
            }
        }

        emit LiquidityAdded(msg.sender, rwaAmount, stableAmount);
    }

    function removeLiquidity(uint256 rwaAmount, uint256 stableAmount, address to) external nonReentrant {
        if (msg.sender == creator) {
            require(block.timestamp >= expiresAt, "CREATOR_LOCKED");
        }
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
        require(liquidityInitialized, "NOT_INITIALIZED");
        require(block.timestamp < expiresAt, "POOL_EXPIRED");
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

    function _calcVirtualReserves(uint256 realRwa, uint256 realStable, uint256 priceMoveBps)
        internal
        pure
        returns (uint256 vRwaCalc, uint256 vStableCalc)
    {
        uint256 up = ((BPS + priceMoveBps) * FIXED_ONE) / BPS;
        uint256 rUp = _sqrt(up * FIXED_ONE);

        vRwaCalc = _divCeil(realRwa * FIXED_ONE, rUp - FIXED_ONE);
        vStableCalc = _divCeil(realStable * vRwaCalc, realRwa);
    }

    function _divCeil(uint256 numerator, uint256 denominator) internal pure returns (uint256) {
        if (numerator == 0) {
            return 0;
        }
        return (numerator - 1) / denominator + 1;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y == 0) {
            return 0;
        }
        uint256 x = y;
        z = (x + 1) / 2;
        while (z < x) {
            x = z;
            z = (y / z + z) / 2;
        }
        return x;
    }
}
