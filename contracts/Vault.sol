// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import {IERC1155} from  "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

/**
 * @title Farconic Staking Vault Contract
 * @author https://github.com/qedric
 */
abstract contract Vault is IERC1155Receiver {

    struct StakeInfo {
        address[] tokenAddresses;
        uint256 stakeTimestamp;
        uint256 lockPeriod;
        uint256 tokenId;
    }

    /// @notice Mapping from user to an array of their stakes
    mapping(address => StakeInfo[]) public userStakes;

    event TokensStaked(address indexed user, StakeInfo stakeInfo);
    event TokensRedeemed(address indexed user, StakeInfo stakeInfo);

        /// @dev the minimum period in days that a token must be staked for
    uint16 public MIN_STAKE_DAYS = 90;

    function _stakeTokens(address[] memory tokens, uint256 daysToLock, uint256 tokenId) internal {
        require(tokens.length > 0, "No tokens to stake");

        // Transfer tokens from user to this contract
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC1155(tokens[i]).safeTransferFrom(msg.sender, address(this), 0, 1, "");
        }

        StakeInfo memory stakeinfo = StakeInfo({
            tokenAddresses: tokens,
            stakeTimestamp: block.timestamp,
            lockPeriod: daysToLock * 1 days,
            tokenId: tokenId
        });

        // Record the stake information
        userStakes[msg.sender].push(stakeinfo);

        emit TokensStaked(msg.sender, stakeinfo);
    }

    function _redeemTokens(uint256 stakeIndex) internal {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");

        StakeInfo memory stake = userStakes[msg.sender][stakeIndex];
        require(block.timestamp >= stake.stakeTimestamp + stake.lockPeriod, "Tokens are still locked");

        // Transfer tokens back to user
        for (uint256 i = 0; i < stake.tokenAddresses.length; i++) {
            IERC1155(stake.tokenAddresses[i]).safeTransferFrom(address(this), msg.sender, 0, 1, "");
        }

        // Remove the stake from the user's list of stakes
        userStakes[msg.sender][stakeIndex] = userStakes[msg.sender][userStakes[msg.sender].length - 1];
        userStakes[msg.sender].pop();

        emit TokensRedeemed(msg.sender, stake);
    }

    /// @notice triggered if the contract is sent ETH without data
    receive() external payable {
        revert("ETH not accepted");
    }

    /// @notice triggered if the contract is called with data that does not match any function signature
    fallback() external payable {
        revert("ETH not accepted");
    }

    // implement onERC1155Received
    function onERC1155Received(address, address, uint256, uint256, bytes calldata) public pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    // implement onERC1155BatchReceived
    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) public pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}