// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

/**
 *  The 'signature minting' mechanism used in thirdweb Token smart contracts is a way for a contract admin to authorize an external party's
 *  request to mint or burn tokens on the admin's contract.
 *
 *  At a high level, this means you can authorize some external party to mint or burn tokens on your contract, and specify which tokens will be
 *  minted or burned by that external party.
 * 
 *  Q - removed superfluous params and added burn request
 */
interface ICitiesSignedRequest {

    /**
     *  @notice The body of a request to mint or burn tokens.
     *
     *  @param targetAddress The receiver/holder of the tokens.
     *  @param tokenId The token id to mint/burn.
     *  @param qty The qty of the token to mint/burn.
     *  @param validityStartTimestamp The unix timestamp after which the payload is valid.
     *  @param validityEndTimestamp The unix timestamp at which the payload expires.
     *  @param uid A unique identifier for the payload.
     */
    struct Request {
        address targetAddress;
        uint256 tokenId;
        uint256 qty;
        uint128 validityStartTimestamp;
        uint128 validityEndTimestamp;
        bytes32 uid;
    }

    /// @dev Emitted when tokens are minted.
    event TokensMintedWithSignature(
        address indexed signer,
        address indexed recipient,
        uint256 tokenId,
        uint256 qty
    );

    /// @dev Emitted when tokens are burned.
    event TokensBurnedWithSignature(
        address indexed signer,
        address indexed holder,
        uint256 tokenId,
        uint256 qty
    );

    /**
     *  @notice Verifies that a request is signed by an account holding
     *          MINTER_ROLE (at the time of the function call).
     *
     *  @param req The payload / request.
     *  @param signature The signature produced by an account signing the request.
     *
     *  returns (success, signer) Result of verification and the recovered address.
     */
    function verify(
        Request calldata req,
        bytes calldata signature
    ) external view returns (bool success, address signer);

    /**
     *  @notice Mints tokens according to the provided request.
     *
     *  @param req The payload / request.
     *  @param signature The signature produced by an account signing the request.
     */
    function mintWithSignature(
        Request calldata req,
        bytes calldata signature
    ) external returns (address signer);

    /**
     *  @notice Burns tokens according to the provided request.
     *
     *  @param req The payload / request.
     *  @param signature The signature produced by an account signing the request.
     */
    function burnWithSignature(
        Request calldata req,
        bytes calldata signature
    ) external returns (address signer);
}
