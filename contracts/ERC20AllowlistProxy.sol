// SPDX-License-Identifier: MIT
// Versa Contracts v1.0.0 (/contracts/ERC20AllowlistProxy.sol)
pragma solidity 0.8.20;

import "./AllowlistRegistry.sol";

/**
 * @dev Contraact which allows children to implement an allowlist mechanism
 * that can be called by an authorized account.
 *
 * This contract is inherited by ERC20 contracts that need to implement an allowlist.
 */

abstract contract ERC20AllowlistProxy {
    address private _registry;

    /**
     * @dev Emitted when allowlist registry address has changed.
     */
    event AllowlistRegistryChanged(
        address indexed previousRegistry,
        address indexed newRegistry
    );

    /**
     * @dev Returns the allowlist registry contract address.
     */
    function allowlistRegistry() external view returns (address) {
        return _registry;
    }

    /**
     * @dev Returns the allowlist status of an account
     */
    function isAllowlist(address account) public view virtual returns (bool) {
        require(
            account != address(0),
            "ERC20AllowlistProxy: account can not be the zero address"
        );

        AllowlistRegistry registry = AllowlistRegistry(_registry);
        return registry.isAllowlist(account);
    }

    /**
     * @dev Set the `registry` contract address.
     */
    function _setAllowlistRegistry(address newRegistry) internal virtual {
        require(
            address(newRegistry) != address(0),
            "ERC20AllowlistProxy: new registry can not be the zero address"
        );

        address oldRegistry = _registry;
        _registry = newRegistry;

        emit AllowlistRegistryChanged(oldRegistry, newRegistry);
    }
}
