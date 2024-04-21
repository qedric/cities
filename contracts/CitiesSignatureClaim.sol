// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

import "./interfaces/ICitiesSignatureClaim.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/utils/cryptography/EIP712.sol";

abstract contract CitiesSignatureClaim is EIP712, ICitiesSignatureClaim {
    using ECDSA for bytes32;

    bytes32 internal constant TYPEHASH =
        keccak256(
            "ClaimRequest(address to,uint256[] inTokenIds,uint256 outTokenId,uint128 validityStartTimestamp,uint128 validityEndTimestamp,bytes32 uid)"
        );

    /// @dev Mapping from claim request UID => whether the claim request is processed.
    mapping(bytes32 => bool) private claimed;

    constructor() EIP712("CitiesSignatureClaim", "1") {}

    /// @dev Verifies that a claim request is signed by an account holding MINTER_ROLE (at the time of the function call).
    function verify(
        ClaimRequest calldata _req,
        bytes calldata _signature
    ) public view override returns (bool success, address signer) {
        signer = _hashTypedDataV4(keccak256(_encodeRequest(_req))).recover(_signature);
        success = !claimed[_req.uid] && _canSignClaimRequest(signer);
    }

    /// @dev Returns whether a given address is authorized to sign requests.
    function _canSignClaimRequest(address _signer) internal view virtual returns (bool);

    /// @dev Verifies a claim request and marks the request as claimed.
    function _processRequest(ClaimRequest calldata _req, bytes calldata _signature) internal returns (address signer) {
        bool success;
        (success, signer) = verify(_req, _signature);

        require(success, "Invalid request");
        require(
            _req.validityStartTimestamp <= block.timestamp && block.timestamp <= _req.validityEndTimestamp,
            "Request expired"
        );
        require(_req.to != address(0), "recipient undefined");

        claimed[_req.uid] = true;
    }

    /// @dev Resolves 'stack too deep' error in `recoverAddress`.
    function _encodeRequest(ClaimRequest calldata _req) internal pure returns (bytes memory) {
        return
            abi.encode(
                TYPEHASH,
                _req.to,
                keccak256(abi.encodePacked(_req.inTokenIds)),  
                _req.outTokenId,
                _req.validityStartTimestamp,
                _req.validityEndTimestamp,
                _req.uid
            );
    }
}