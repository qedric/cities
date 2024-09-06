// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

import "./interfaces/ICitiesSignedRequest.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/utils/cryptography/EIP712.sol";

abstract contract CitiesSignedRequest is EIP712, ICitiesSignedRequest {
    using ECDSA for bytes32;

    bytes32 internal constant TYPEHASH =
        keccak256(
            "Request(address[] targetAddresses,uint256[] amounts,uint256 tokenId,string tokenURI,uint128 validityStartTimestamp,uint128 validityEndTimestamp)"
        );

    constructor() EIP712("CitiesSignedRequest", "1") {}

    /// @dev Verifies that a claim request is signed by an account holding MINTER_ROLE (at the time of the function call).
    function verify(
        Request calldata _req,
        bytes calldata _signature
    ) public view override returns (bool success, address signer) {
        bytes32 digest = _hashTypedDataV4(keccak256(_encodeRequest(_req)));
        signer = digest.recover(_signature);
        success = _canSignRequest(signer);
    }

    /// @dev Returns whether a given address is authorized to sign requests.
    function _canSignRequest(address _signer) internal view virtual returns (bool);

    /// @dev Verifies a claim request and marks the request as claimed.
    function _processRequest(Request calldata _req, bytes calldata _signature) internal view returns (address signer) {
        bool success;
        (success, signer) = verify(_req, _signature);

        require(success, "Invalid request");
        require(
            _req.validityStartTimestamp <= block.timestamp && block.timestamp <= _req.validityEndTimestamp,
            "Request expired"
        );
        require(_req.targetAddresses.length > 0, "recipient undefined");
    }

    /// @dev Resolves 'stack too deep' error in `recoverAddress`.
    function _encodeRequest(Request calldata _req) internal pure returns (bytes memory) {
        return
            abi.encode(
                TYPEHASH,
                keccak256(abi.encodePacked(_req.targetAddresses)),
                keccak256(abi.encodePacked(_req.amounts)),
                _req.tokenId,
                keccak256(bytes(_req.tokenURI)),
                _req.validityStartTimestamp,
                _req.validityEndTimestamp
            );
    }
}