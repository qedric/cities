// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

/**
 *  The 'signature claiming' mechanism used in thirdweb Token smart contracts is a way for a contract admin to authorize an external party's
 *  request to claim tokens on the admin's contract.
 *
 *  At a high level, this means you can authorize some external party to claim tokens on your contract, and specify what exactly will be
 *  claimed by that external party.
 * 
 *  Q - removed superfluous params and added params to provide the input tokens to lock
 */
interface ICitiesSignatureClaim {
    /**
     *  @notice The body of a request to claim tokens.
     *
     *  @param to The receiver of the tokens to claim.
     *  @param inTokenAddresses The token addresses of the tokens to lock.
     *  @param outTokenId The tokenId of the token to claim.
     *  @param validityStartTimestamp The unix timestamp after which the payload is valid.
     *  @param validityEndTimestamp The unix timestamp at which the payload expires.
     *  @param uid A unique identifier for the payload.
     */
    struct StakeRequest {
        address to;
        address[] inTokenAddresses;
        uint256 outTokenId;
        uint128 validityStartTimestamp;
        uint128 validityEndTimestamp;
        bytes32 uid;
    }

    /// @dev Emitted when tokens are claimed.
    event TokensStakedWithSignature(
        address indexed signer,
        address indexed recipient,
        uint256 indexed tokenIdClaimed,
        StakeRequest claimRequest
    );

    /**
     *  @notice Verifies that a claim request is signed by an account holding
     *          MINTER_ROLE (at the time of the function call).
     *
     *  @param req The payload / claim request.
     *  @param signature The signature produced by an account signing the claim request.
     *
     *  returns (success, signer) Result of verification and the recovered address.
     */
    function verify(
        StakeRequest calldata req,
        bytes calldata signature
    ) external view returns (bool success, address signer);

    /**
     *  @notice Stakes tokens according to the provided request and optionally mints a new token.
     *
     *  @param req The payload / claim request.
     *  @param signature The signature produced by an account signing the request.
     */
    function stake(
        StakeRequest calldata req,
        bytes calldata signature
    ) external returns (address signer);
}
