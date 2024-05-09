// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author Q - https://warpcast.com/berlin

interface IOtherTokenInterface {
    // Define signature of balanceOf
    function balanceOf(address owner) external view returns (uint256);
}

/// @title AllowList
/// @notice Maintains an allowlist and also checks if an address has a balance of another token.
abstract contract AllowList {

    /// @notice Emitted when the caller is not authorized to modify the allowList.
    error AllowListUnauthorized();

    /// @notice mapping for the allowList.
    mapping(address => bool) public allowList;

    /// @notice address of an external token to check for balance.
    address public allowOtherTokenAddress;

    function isAllowListed(address _address) public view returns (bool) {
        return allowList[_address];
    }

    function hasAllowListedBalance(address _address) public view returns (bool) {
        return _balanceOfOtherToken(_address) > 0;
    }

    function _balanceOfOtherToken(address _address) internal view returns (uint256) {
        IOtherTokenInterface otherToken = IOtherTokenInterface(allowOtherTokenAddress);
        return otherToken.balanceOf(_address);
    }

    /// @dev Should return whether the sender is authorized to modify the allowList.
    function _canModifyAllowList() internal view virtual returns (bool) {
    }

    function addToAllowList(address _address) external {
        if (!_canModifyAllowList()) {
            revert AllowListUnauthorized();
        }
        allowList[_address] = true;
    }

    function removeFromAllowList(address _address) external {
        if (!_canModifyAllowList()) {
            revert AllowListUnauthorized();
        }
        allowList[_address] = false;
    }

    function setAllowTokenAddress(address _address) external {
        if (!_canModifyAllowList()) {
            revert AllowListUnauthorized();
        }
        allowOtherTokenAddress = _address;
    }
}