// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReservationManager} from "./ReservationManager.sol";

contract ReservationManagerDeployer {
    function deployReservationManager(IERC20 stable, address owner)
        external
        returns (ReservationManager reservations)
    {
        require(owner != address(0), "ZERO_OWNER");

        reservations = new ReservationManager(stable, address(0));
        reservations.transferOwnership(owner);
    }
}
