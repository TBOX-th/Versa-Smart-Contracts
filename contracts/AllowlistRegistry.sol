// SPDX-License-Identifier: MIT
// Versa Contracts v1.0.0 (/contracts/AllowlistRegistry.sol)

pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Contract which provides a registry of addresses that are allowed to interact with the contract.
 *
 * Only the owner can add or remove addresses from the registry.
 */
contract AllowlistRegistry is Ownable {
    mapping(address => bool) private _allowlist;

    /**
     * @dev Emitted when a new `account` is added to the allowlist.
     */
    event AddedAllowlist(address indexed account);

    /**
     * @dev Emitted when an `account` is removed from the allowlist.
     */
    event RemovedAllowlist(address indexed account);

    /**
     * @dev Returns true if the `account` is allowed to interact with the contract.
     */
    function isAllowlist(address account) external view virtual returns (bool) {
        return _allowlist[account];
    }

    /**
     * @dev Adds `account` to the allowlist.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     */
    function addAllowlist(address account) external virtual onlyOwner {
        _allowlist[account] = true;

        emit AddedAllowlist(account);
    }

    /**
     * @dev Removes `account` from the allowlist.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     */
    function removeAllowlist(address account) external virtual onlyOwner {
        _allowlist[account] = false;

        emit RemovedAllowlist(account);
    }
}
