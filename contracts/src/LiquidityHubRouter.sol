// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {ISwapAdapter} from "./interfaces/ISwapAdapter.sol";
import {Ownable} from "./libraries/Ownable.sol";
import {ReentrancyGuard} from "./libraries/ReentrancyGuard.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";
import {CoreVirtualReservePool} from "./CoreVirtualReservePool.sol";
import {ReservationManager} from "./ReservationManager.sol";

contract LiquidityHubRouter is Ownable, ReentrancyGuard {
    using TransferHelper for IERC20;

    CoreVirtualReservePool public core;
    ReservationManager public reservations;
    IERC20 public stable;
    IERC20 public rwa;

    mapping(address => address) public adapterForBase;
    mapping(address => bool) public supportedBase;

    event AdapterUpdated(address indexed baseToken, address indexed adapter, bool supported);
    event RoutedSwap(
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 filledRwa,
        uint256 reservedStable
    );
    event RoutedSwapToStable(address indexed user, uint256 rwaIn, uint256 stableOut, uint256 rwaRefunded);
    event ReservationClaimed(address indexed user, uint256 stableUsed, uint256 rwaReceived, uint256 remainingStable);
    event QueueProcessed(uint256 processedUsers, uint256 processedStable);
    event QuotesPurged(uint256 purgedUsers, uint256 refundedStable);

    constructor(CoreVirtualReservePool _core, ReservationManager _reservations) {
        core = _core;
        reservations = _reservations;
        stable = _core.stable();
        rwa = _core.rwa();
    }

    function setAdapter(address baseToken, address adapter, bool supported) external onlyOwner {
        require(baseToken != address(0), "ZERO_TOKEN");
        adapterForBase[baseToken] = adapter;
        supportedBase[baseToken] = supported;
        emit AdapterUpdated(baseToken, adapter, supported);
    }

    function quoteToRwaExactIn(address tokenIn, uint256 amountIn)
        external
        view
        returns (uint256 rwaOutQuote, uint256 rwaOutCap, uint256 stableAmount, bool willReserve)
    {
        require(amountIn > 0, "ZERO_AMOUNT");

        if (tokenIn == address(stable)) {
            stableAmount = amountIn;
        } else {
            require(supportedBase[tokenIn], "UNSUPPORTED_BASE");
            address adapter = adapterForBase[tokenIn];
            require(adapter != address(0), "NO_ADAPTER");
            stableAmount = ISwapAdapter(adapter).quoteExactIn(tokenIn, amountIn);
        }

        (uint256 amountOut, uint256 maxFillOut,) = core.quoteExactIn(address(stable), stableAmount);
        rwaOutQuote = amountOut;
        rwaOutCap = maxFillOut;
        willReserve = amountOut > maxFillOut;
    }

    function swapToRwaExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minRwaOut,
        address recipient,
        bool allowReserve
    ) external nonReentrant returns (uint256 filledRwa, uint256 reservedStable) {
        require(block.timestamp < core.expiresAt(), "POOL_EXPIRED");
        require(recipient != address(0), "ZERO_ADDRESS");
        require(amountIn > 0, "ZERO_AMOUNT");

        _processQueue(type(uint256).max);

        uint256 stableQuote = amountIn;
        address adapter = address(0);
        if (tokenIn != address(stable)) {
            require(supportedBase[tokenIn], "UNSUPPORTED_BASE");
            adapter = adapterForBase[tokenIn];
            require(adapter != address(0), "NO_ADAPTER");
            stableQuote = ISwapAdapter(adapter).quoteExactIn(tokenIn, amountIn);
        }
        require(stableQuote > 0, "ZERO_AMOUNT");

        (, uint256 maxFillOut,) = core.quoteExactIn(address(stable), stableQuote);
        bool noLiquidity = maxFillOut == 0;
        if (noLiquidity) {
            require(allowReserve, "NO_LIQUIDITY");
            require(minRwaOut == 0, "MIN_OUT");
        }

        uint256 stableAmount = amountIn;
        if (tokenIn == address(stable)) {
            stable.safeTransferFrom(msg.sender, address(this), amountIn);
        } else {
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
            IERC20(tokenIn).safeApprove(adapter, amountIn);
            stableAmount = ISwapAdapter(adapter).swapExactIn(tokenIn, amountIn, 0, address(this));
        }

        if (noLiquidity) {
            reservedStable = stableAmount;
            stable.safeApprove(address(reservations), reservedStable);
            reservations.createReservation(recipient, reservedStable);
            emit RoutedSwap(msg.sender, tokenIn, amountIn, 0, reservedStable);
            return (0, reservedStable);
        }

        stable.safeApprove(address(core), stableAmount);
        uint256 amountInUsed;
        (filledRwa, amountInUsed) = core.swapExactIn(address(stable), stableAmount, minRwaOut, recipient);

        if (stableAmount > amountInUsed) {
            reservedStable = stableAmount - amountInUsed;
            if (allowReserve) {
                stable.safeApprove(address(reservations), reservedStable);
                reservations.createReservation(recipient, reservedStable);
            } else {
                stable.safeTransfer(msg.sender, reservedStable);
            }
        }

        emit RoutedSwap(msg.sender, tokenIn, amountIn, filledRwa, reservedStable);
    }

    function swapToStableExactIn(
        uint256 amountIn,
        uint256 minStableOut,
        address recipient,
        uint256 maxUsers
    ) external nonReentrant returns (uint256 stableOut, uint256 amountInUsed) {
        require(block.timestamp < core.expiresAt(), "POOL_EXPIRED");
        require(recipient != address(0), "ZERO_ADDRESS");
        require(amountIn > 0, "ZERO_AMOUNT");

        rwa.safeTransferFrom(msg.sender, address(this), amountIn);
        rwa.safeApprove(address(core), amountIn);
        (stableOut, amountInUsed) = core.swapExactIn(address(rwa), amountIn, minStableOut, recipient);

        if (amountInUsed < amountIn) {
            uint256 refund = amountIn - amountInUsed;
            rwa.safeTransfer(msg.sender, refund);
            emit RoutedSwapToStable(msg.sender, amountIn, stableOut, refund);
        } else {
            emit RoutedSwapToStable(msg.sender, amountIn, stableOut, 0);
        }

        if (maxUsers > 0) {
            uint256 processedUsers;
            uint256 processedStable;
            (processedUsers, processedStable) = _processQueue(maxUsers);
            emit QueueProcessed(processedUsers, processedStable);
        }
    }

    function addLiquidityAndProcess(uint256 rwaAmount, uint256 stableAmount, uint256 maxUsers)
        external
        nonReentrant
        returns (uint256 processedUsers, uint256 processedStable)
    {
        require(rwaAmount > 0 || stableAmount > 0, "ZERO_LIQUIDITY");
        require(core.liquidityInitialized(), "NOT_INITIALIZED");

        if (rwaAmount > 0) {
            rwa.safeTransferFrom(msg.sender, address(this), rwaAmount);
            rwa.safeApprove(address(core), rwaAmount);
        }
        if (stableAmount > 0) {
            stable.safeTransferFrom(msg.sender, address(this), stableAmount);
            stable.safeApprove(address(core), stableAmount);
        }

        core.addLiquidity(rwaAmount, stableAmount);

        if (maxUsers > 0) {
            if (block.timestamp >= core.expiresAt()) {
                (processedUsers, processedStable) = _purgeExpiredQuotes(maxUsers);
                emit QuotesPurged(processedUsers, processedStable);
            } else {
                (processedUsers, processedStable) = _processQueue(maxUsers);
                emit QueueProcessed(processedUsers, processedStable);
            }
        }
    }

    function claimReservation(uint256 minRwaOut, address recipient) external nonReentrant returns (uint256 filledRwa) {
        require(block.timestamp < core.expiresAt(), "POOL_EXPIRED");
        require(recipient != address(0), "ZERO_ADDRESS");

        uint256 reserved = reservations.reservedStable(msg.sender);
        require(reserved > 0, "NO_RESERVATION");

        (address headUser,) = reservations.nextReservation();
        require(headUser == msg.sender, "NOT_HEAD");

        reservations.releaseStable(msg.sender, reserved, address(this));
        stable.safeApprove(address(core), reserved);
        uint256 amountInUsed;
        (filledRwa, amountInUsed) = core.swapExactIn(address(stable), reserved, minRwaOut, recipient);

        uint256 remaining = reserved - amountInUsed;
        if (remaining > 0) {
            stable.safeApprove(address(reservations), remaining);
            reservations.createReservation(msg.sender, remaining);
        }

        emit ReservationClaimed(msg.sender, amountInUsed, filledRwa, remaining);
    }

    function processQueue(uint256 maxUsers)
        external
        nonReentrant
        returns (uint256 processedUsers, uint256 processedStable)
    {
        if (block.timestamp >= core.expiresAt()) {
            (processedUsers, processedStable) = _purgeExpiredQuotes(maxUsers);
            emit QuotesPurged(processedUsers, processedStable);
            return (processedUsers, processedStable);
        }

        (processedUsers, processedStable) = _processQueue(maxUsers);
        emit QueueProcessed(processedUsers, processedStable);
    }

    function purgeExpiredQuotes(uint256 maxUsers)
        external
        nonReentrant
        returns (uint256 purgedUsers, uint256 refundedStable)
    {
        require(block.timestamp >= core.expiresAt(), "NOT_EXPIRED");
        (purgedUsers, refundedStable) = _purgeExpiredQuotes(maxUsers);
        emit QuotesPurged(purgedUsers, refundedStable);
    }

    function cancelReservation() external nonReentrant {
        reservations.cancel();
    }

    function cancelReservationFor(address user) external nonReentrant {
        require(user != address(0), "ZERO_ADDRESS");
        require(msg.sender == user || msg.sender == owner, "NOT_AUTH");
        reservations.cancelFor(user);
    }

    function _processQueue(uint256 maxUsers)
        internal
        returns (uint256 processedUsers, uint256 processedStable)
    {
        if (maxUsers == 0) {
            return (0, 0);
        }

        for (uint256 i = 0; i < maxUsers; i++) {
            (address user, uint256 amount) = reservations.nextReservation();
            if (user == address(0) || amount == 0) {
                break;
            }

            (, uint256 maxFillOut,) = core.quoteExactIn(address(stable), amount);
            if (maxFillOut == 0) {
                break;
            }

            reservations.releaseStable(user, amount, address(this));
            stable.safeApprove(address(core), amount);
            (uint256 filledRwa, uint256 amountInUsed) = core.swapExactIn(address(stable), amount, 0, user);

            processedUsers += 1;
            processedStable += amountInUsed;

            if (amountInUsed < amount) {
                uint256 remaining = amount - amountInUsed;
                stable.safeApprove(address(reservations), remaining);
                reservations.createReservation(user, remaining);
                emit ReservationClaimed(user, amountInUsed, filledRwa, remaining);
                break;
            }

            emit ReservationClaimed(user, amountInUsed, filledRwa, 0);
        }
    }

    function _purgeExpiredQuotes(uint256 maxUsers)
        internal
        returns (uint256 purgedUsers, uint256 refundedStable)
    {
        if (maxUsers == 0) {
            return (0, 0);
        }

        for (uint256 i = 0; i < maxUsers; i++) {
            (address user, uint256 amount) = reservations.nextReservation();
            if (user == address(0) || amount == 0) {
                break;
            }

            reservations.cancelFor(user);
            purgedUsers += 1;
            refundedStable += amount;
        }
    }
}
