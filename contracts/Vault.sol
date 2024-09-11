// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

/**
 * @title Farconic Staking Vault Contract
 * @author https://github.com/qedric
 */
contract Vault is IERC1155Receiver, PermissionsEnumerable {

    error ArrayLengthMismatch(uint256 lengthA, uint256 lengthB);
    error NoTokensToStake();
    error MinimumStakePeriodNotMet(uint256 provided, uint256 required);
    error NotAuthorised();
    error NotFound();
    error TokenNotAllowed();
    error InsufficientBalance();
    error InvalidStakeIndex();
    error ETHNotAccepted();

    event TokensStaked(
        address indexed user,
        address indexed operator,
        StakeInfo stakeInfo
    );

    event TokensRedeemed(
        address indexed user,
        address indexed operator,
        StakeInfo stakeInfo
    );

    event TokenReceivedWithMessage(address indexed from, uint256 id, uint256 amount, address operator, bytes data);

    event TokensReceivedWithMessage(address indexed from, uint256 batchSize, address operator, bytes data);


    struct StakeInfo {
        address[] tokenAddresses;
        uint256[] tokenIds; // Add tokenIds to the struct
        uint256[] amounts;
        uint256 stakeTimestamp;
        uint256 lockPeriod;
        uint256 id;
    }

    /// @notice Mapping from user to an array of their stakes
    mapping(address => StakeInfo[]) public userStakes;

    // Custom getter for tokenAddresses
    function getTokenAddresses(address user, uint256 index) public view returns (address[] memory) {
        return userStakes[user][index].tokenAddresses;
    }

    // Custom getter for tokenIds
    function getTokenIds(address user, uint256 index) public view returns (uint256[] memory) {
        return userStakes[user][index].tokenIds;
    }

    // Custom getter for amounts
    function getAmounts(address user, uint256 index) public view returns (uint256[] memory) {
        return userStakes[user][index].amounts;
    }

    /// @notice Mapping to store allowed token addresses
    mapping(address => bool) public allowedTokens;

    /// @notice Mapping of allowed operators (other than the user) to stake & redeem tokens
    mapping(address => bool) public allowedOperators;

    /// @notice Mapping from user to token address to unstaked amounts
    mapping(address => mapping(address => uint256)) public unstakedBalances;

    /// @dev the minimum period in days that a token must be staked for
    uint16 public min_stake_days = 90;

    /**
     * @notice Initializes the contract with the given parameters.
     *
     * @param _defaultAdmin         The default admin for the contract.
     */
    constructor(address _defaultAdmin) {
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
    }

    /*///////////////////////////////////////////////////////////////
                    User functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Approves this contract to transfer given tokens in and out of the vault.
     * 
     * @param tokenAddresses        The token addresses to approve.
     */
    function batchApprove(address[] calldata tokenAddresses) external {
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            IERC1155(tokenAddresses[i]).setApprovalForAll(address(this), true);
        }
    }

    /**
     * @notice Stakes tokens in the vault.
     *
     * @param tokens The token addresses to stake.
     * @param tokenIds The token IDs to stake.
     * @param amounts The amounts of tokens to stake.
     * @param staker The owner of the tokens to be staked.
     * @param daysToLock The number of days to lock the tokens.
     * @param id an id to associate the stake with, eg. a tokenId.
     */
    function stake(
        address[] memory tokens,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        address staker,
        uint256 daysToLock,
        uint256 id
    ) external {
        if (amounts.length != tokens.length) revert ArrayLengthMismatch(amounts.length, tokens.length);
        if (tokenIds.length != tokens.length) revert ArrayLengthMismatch(tokenIds.length, tokens.length);
        if (tokens.length == 0) revert NoTokensToStake();
        if (daysToLock < min_stake_days) revert MinimumStakePeriodNotMet(daysToLock, min_stake_days);
        if (staker != msg.sender && !allowedOperators[msg.sender]) revert NotAuthorised();

        // Check if all tokens are allowed
        for (uint256 i = 0; i < tokens.length; i++) {
            if (!allowedTokens[tokens[i]]) revert TokenNotAllowed();
        }

        StakeInfo memory stakeinfo = StakeInfo({
            tokenAddresses: tokens,
            tokenIds: tokenIds,
            amounts: amounts,
            stakeTimestamp: block.timestamp,
            lockPeriod: daysToLock * 1 days,
            id: id
        });

        // Record the stake information
        userStakes[staker].push(stakeinfo);

        // Transfer tokens from user to this contract
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC1155(tokens[i]).safeTransferFrom(
                staker,
                address(this),
                tokenIds[i],
                amounts[i],
                ""
            );
        }

        emit TokensStaked(staker, msg.sender, stakeinfo);
    }

    /**
     * @notice Stakes tokens after they are deposited in this contract.
     *
     * @param tokens The token addresses to stake.
     * @param amounts The amounts of tokens to stake.
     * @param daysToLock The number of days to lock the tokens.
     * @param id an id to associate the stake with, eg. a tokenId.
     */
    function retroactiveStake(
        address[] memory tokens,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        address staker,
        uint256 daysToLock,
        uint256 id
    ) external {
        if (amounts.length != tokens.length) revert ArrayLengthMismatch(amounts.length, tokens.length);
        if (tokens.length == 0) revert NoTokensToStake();
        if (daysToLock < min_stake_days) revert MinimumStakePeriodNotMet(daysToLock, min_stake_days);
        if (staker != msg.sender && !allowedOperators[msg.sender]) revert NotAuthorised();

        for (uint256 i = 0; i < tokens.length; i++) {
            // Ensure the user has sufficient unstaked balance to create a new stake
            if (unstakedBalances[msg.sender][tokens[i]] < amounts[i]) revert InsufficientBalance();
            // Deduct the staked amounts from the unstaked balance
            unstakedBalances[msg.sender][tokens[i]] -= amounts[i];
        }

        StakeInfo memory stakeinfo = StakeInfo({
            tokenAddresses: tokens,
            tokenIds: tokenIds,
            amounts: amounts,
            stakeTimestamp: block.timestamp,
            lockPeriod: daysToLock * 1 days,
            id: id
        });

        // Record the stake information
        userStakes[msg.sender].push(stakeinfo);

        emit TokensStaked(msg.sender, msg.sender, stakeinfo);
    }

    /**
     * @notice Redeems tokens from the vault.
     *
     * @param staker The recipient of the tokens to be redeemed
     * @param stakeIndex The index of the stake to redeem.
     */
    function redeemTokens(address staker, uint256 stakeIndex) external {
        if (userStakes[staker].length == 0) revert NotFound();
        if (stakeIndex >= userStakes[staker].length) revert InvalidStakeIndex();

        // Ensure that the caller is the staker or an allowed operator
        if (staker != msg.sender && !allowedOperators[msg.sender]) revert NotAuthorised();

        StakeInfo memory stakeInfo = userStakes[staker][stakeIndex];

        if (block.timestamp < stakeInfo.stakeTimestamp + stakeInfo.lockPeriod) revert MinimumStakePeriodNotMet(block.timestamp, stakeInfo.stakeTimestamp + stakeInfo.lockPeriod);

        // Remove the stake from the user's list of stakes
        userStakes[staker][stakeIndex] = userStakes[staker][
            userStakes[staker].length - 1
        ];
        userStakes[staker].pop();

        // Transfer tokens back to the user
        for (uint256 i = 0; i < stakeInfo.tokenAddresses.length; i++) {
            IERC1155(stakeInfo.tokenAddresses[i]).safeTransferFrom(
                address(this),
                staker,
                0,
                stakeInfo.amounts[i],
                ""
            );
        }

        emit TokensRedeemed(staker, msg.sender, stakeInfo);
    }

    /*///////////////////////////////////////////////////////////////
                    Admin functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets the minimum stake period in days.
     *
     * @param daysToLock The minimum stake period in days.
     */
    function setMinStakeDays(
        uint16 daysToLock
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        min_stake_days = daysToLock;
    }

    /**
     * @notice Adds a token address to the allow list.
     *
     * @param token The token address to add.
     */
    function addAllowedToken(
        address token
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[token] = true;
    }

    /**
     * @notice Removes a token address from the allow list.
     *
     * @param token The token address to remove.
     */
    function removeAllowedToken(
        address token
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedTokens[token] = false;
    }

    /// @notice triggered if the contract is sent ETH without data
    receive() external payable {
        revert ETHNotAccepted();
    }

    /// @notice triggered if the contract is called with data that does not match any function signature
    fallback() external payable {
        revert ETHNotAccepted();
    }

    // Track received tokens as unstaked
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        // Check if the token is allowed
        if (!allowedTokens[msg.sender]) revert TokenNotAllowed();

        // Log the message (or handle it as needed)
        emit TokenReceivedWithMessage(from, id, value, operator, data);

        // Update the unstaked balance of the user for this token
        unstakedBalances[from][msg.sender] += value;

        // Continue with the default ERC1155 receiver behavior
        return this.onERC1155Received.selector;
    }

    // Batch received tokens as unstaked
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        // Check if the token is allowed
        if (!allowedTokens[msg.sender]) revert TokenNotAllowed();

        if (values.length != ids.length) revert ArrayLengthMismatch(values.length, ids.length);

        // Log the message (or handle it as needed)
        emit TokensReceivedWithMessage(from, ids.length, operator, data);

        for (uint256 i = 0; i < ids.length; i++) {
            // Track batch received tokens
            unstakedBalances[from][msg.sender] += values[i];
        }

        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}