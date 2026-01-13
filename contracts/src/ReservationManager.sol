// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {Ownable} from "./libraries/Ownable.sol";
import {ReentrancyGuard} from "./libraries/ReentrancyGuard.sol";
import {TransferHelper} from "./libraries/TransferHelper.sol";

contract ReservationManager is Ownable, ReentrancyGuard {
    using TransferHelper for IERC20;

    IERC20 public immutable stable;
    address public router;

    mapping(address => uint256) public reservedStable;
    mapping(address => uint64) public createdAt;
    uint64 public ttl;

    event RouterUpdated(address indexed router);
    event TtlUpdated(uint64 ttl);
    event ReservationCreated(address indexed user, uint256 stableAmount);
    event ReservationCancelled(address indexed user, uint256 refundedStable);
    event ReservationReleased(address indexed user, uint256 stableAmount, address indexed to);

    modifier onlyRouter() {
        require(msg.sender == router, "NOT_ROUTER");
        _;
    }

    constructor(IERC20 _stable, address _router) {
        require(address(_stable) != address(0), "ZERO_TOKEN");
        stable = _stable;
        router = _router;
    }

    function setRouter(address _router) external onlyOwner {
        require(_router != address(0), "ZERO_ADDRESS");
        router = _router;
        emit RouterUpdated(_router);
    }

    function setTtl(uint64 _ttl) external onlyOwner {
        ttl = _ttl;
        emit TtlUpdated(_ttl);
    }

    function createReservation(address user, uint256 stableAmount) external onlyRouter nonReentrant {
        require(user != address(0), "ZERO_ADDRESS");
        require(stableAmount > 0, "ZERO_AMOUNT");

        stable.safeTransferFrom(msg.sender, address(this), stableAmount);
        reservedStable[user] += stableAmount;
        if (createdAt[user] == 0) {
            createdAt[user] = uint64(block.timestamp);
        }

        emit ReservationCreated(user, stableAmount);
    }

    function cancel() external nonReentrant {
        uint256 amount = reservedStable[msg.sender];
        require(amount > 0, "NO_RESERVATION");

        reservedStable[msg.sender] = 0;
        createdAt[msg.sender] = 0;
        stable.safeTransfer(msg.sender, amount);

        emit ReservationCancelled(msg.sender, amount);
    }

    function releaseStable(address user, uint256 amount, address to) external onlyRouter nonReentrant {
        require(user != address(0) && to != address(0), "ZERO_ADDRESS");
        require(amount > 0, "ZERO_AMOUNT");
        require(reservedStable[user] >= amount, "INSUFFICIENT_RESERVED");

        reservedStable[user] -= amount;
        if (reservedStable[user] == 0) {
            createdAt[user] = 0;
        }
        stable.safeTransfer(to, amount);

        emit ReservationReleased(user, amount, to);
    }
}
