// SPDX-License-Identifier: MIT
// Versa Contracts v1.0.0 (/contracts/InvestmentToken.sol)
pragma solidity >=0.4.22 <0.9.0;

import "./ERC20AllowlistProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev {ERC20} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - the owner is allowed to mint tokens
 *  - the owner is allowed to pause/unpause all token transfers
 *  - the owner is allowed to add/remove addresses from the allowlist
 *
 * This contract uses {Ownable} to include access control mechanism, where
 * the owner can perform certain operations (like minting tokens).
 *
 * This contract uses {Pausable} to include pausable mechanism, where
 * the owner can pause/unpause all token transfers.
 *
 * This contract uses {ERC20Burnable} to include burnable mechanism, where
 * holders can burn their tokens.
 *
 * This contract uses {ERC20AllowlistProxy} to include allowlist mechanism, where
 * the owner can add/remove addresses from the allowlist.
 *
 * This contract uses {EmergencyWithdrawable} to include emergency withdrawable mechanism, where
 * the owner can withdraw any ERC20 tokens from this contract.
 */
contract InvestmentToken is
    Ownable,
    ERC20,
    ERC20Burnable,
    Pausable,
    ERC20AllowlistProxy
{
    constructor(
        string memory name_,
        string memory symbol_,
        address allowlistRegistry_
    ) ERC20(name_, symbol_) {
        _setAllowlistRegistry(allowlistRegistry_);
    }

    /**
     * @dev Throws if sender or receiver are not allowlisted accounts.
     */
    modifier onlyAllowlist(address sender, address receiver) {
        address _msgSender = _msgSender();

        if (_msgSender != owner()) {
            bool _isAllowlist = isAllowlist(sender) &&
                isAllowlist(receiver) &&
                isAllowlist(_msgSender);
            require(
                _isAllowlist,
                "InvestmentToken: accounts are not allowlisted"
            );
        }

        _;
    }

    /**
     * @dev Set the `allowlistRegistry` contract address.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     */
    function setAllowlistRegistry(
        address allowlistRegistry
    ) external virtual onlyOwner {
        _setAllowlistRegistry(allowlistRegistry);
    }

    /**
     * @dev Creates `amount` new tokens for `owner`.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     * - `_mintable` must not be renounced.
     */
    function mint(uint256 amount) external virtual onlyOwner {
        _mint(msg.sender, amount);
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     * - sender and receiver must be allowlisted accounts.
     * - the contract must not be paused.
     */
    function transfer(
        address to,
        uint256 amount
    )
        public
        virtual
        override
        onlyAllowlist(msg.sender, to)
        whenNotPaused
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: if `amount` is the maximum `uint256` value, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - caller and spender must be allowlisted accounts.
     * - the contract must not be paused.
     */
    function approve(
        address spender,
        uint256 amount
    )
        public
        virtual
        override
        onlyAllowlist(msg.sender, spender)
        whenNotPaused
        returns (bool)
    {
        return super.approve(spender, amount);
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not required by the EIP.
     * See the note at the beginning of {ERC20};
     *
     * NOTE: Does not update the allowance if the current allowance is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least `amount`.
     * - caller, `from` and `to` must be allowlisted accounts.
     * - the contract must not be paused.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    )
        public
        virtual
        override
        onlyAllowlist(from, to)
        whenNotPaused
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * the caller and `spender` must be allowlisted accounts.
     * - the contract must not be paused.
     */
    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
        public
        virtual
        override
        onlyAllowlist(msg.sender, spender)
        whenNotPaused
        returns (bool)
    {
        return super.increaseAllowance(spender, addedValue);
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     * - the caller and `spender` must be allowlisted accounts.
     * - the contract must not be paused.
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    )
        public
        virtual
        override
        onlyAllowlist(msg.sender, spender)
        whenNotPaused
        returns (bool)
    {
        return super.decreaseAllowance(spender, subtractedValue);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     *
     * Requirements:
     *
     * - the caller must be allowlisted account.
     * - the contract must not be paused.
     */
    function burn(
        uint256 amount
    )
        public
        virtual
        override
        onlyAllowlist(msg.sender, msg.sender)
        whenNotPaused
    {
        super.burn(amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     * - the caller and `account` must be allowlisted accounts.
     * - the contract must not be paused.
     */
    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override onlyAllowlist(msg.sender, account) whenNotPaused {
        super.burnFrom(account, amount);
    }

    /**
     * @dev Force transfer by the owner.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - `to` cannot be the zero address.
     * - `to` must be allowlisted account.
     * - the contract must not be paused.
     */
    function adminTransfer(
        address from,
        address to,
        uint256 amount
    ) external virtual onlyOwner {
        _transfer(from, to, amount);
    }

    /**
     * @dev Force burn by the owner.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have a balance of at least `amount`.
     * - the caller must be the owner.
     */
    function adminBurn(
        address account,
        uint256 amount
    ) external virtual onlyOwner {
        _burn(account, amount);
    }

    /**
     * @dev Pauses all token transfers.
     * See {ERC20Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     * See {ERC20Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must be the owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
