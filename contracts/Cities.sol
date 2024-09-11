// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

import { ERC1155 } from "@thirdweb-dev/contracts/eip/ERC1155.sol";
import "@thirdweb-dev/contracts/eip/interface/IERC1155Enumerable.sol";
import "@thirdweb-dev/contracts/extension/ContractMetadata.sol";
import "@thirdweb-dev/contracts/extension/Royalty.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";
import "@thirdweb-dev/contracts/extension/Multicall.sol";
import "@thirdweb-dev/contracts/lib/Strings.sol";
import "./CitiesSignedRequest.sol";

/**
 *      BASE:      ERC1155Base
 *
 *  The `ERC1155Base` smart contract implements the ERC1155 NFT standard.
 *  It includes the following additions to standard ERC1155 logic:
 *
 *      - Contract metadata for royalty support on platforms such as OpenSea that use
 *        off-chain information to distribute roaylties.
 *
 *      - Multicall capability to perform multiple actions atomically
 *
 *      - EIP 2981 compliance for royalty support on NFT marketplaces.
 *
 */

contract Cities is
    ERC1155,
    IERC1155Enumerable,
    ContractMetadata,
    Royalty,
    PermissionsEnumerable,
    CitiesSignedRequest,
    Multicall
{
    using Strings for uint256;

    /*///////////////////////////////////////////////////////////////
                            State variables
    //////////////////////////////////////////////////////////////*/

    /// @dev Only MINTER_ROLE holders can sign off on `ClaimRequests and lazy mint tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @dev Only METADATA_ROLE holders can reveal the URI for a batch of delayed reveal NFTs, and update or freeze batch metadata.
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");

    /// @dev The tokenId of the next NFT to mint.
    uint256 internal nextTokenIdToMint_;

    /*//////////////////////////////////////////////////////////////
                            Mappings
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Returns the total supply of NFTs of a given tokenId
     *  @dev Mapping from tokenId => total circulating supply of NFTs of that tokenId.
     */
    mapping(uint256 => uint256) public totalSupply;

    /*///////////////////////////////////////////////////////////////
                                Constructor
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the contract with the given parameters.
     *
     * @param _defaultAdmin         The default admin for the contract.
     * @param _name                 The name of the contract.
     * @param _symbol               The symbol of the contract.
     * @param _royaltyRecipient     The address to which royalties should be sent.
     * @param _royaltyBps           The royalty basis points to be charged. Max = 10000 (10000 = 100%, 1000 = 10%)
     */
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    ) ERC1155(_name, _symbol) {
        
        _setupDefaultRoyaltyInfo(_royaltyRecipient, _royaltyBps);

        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(MINTER_ROLE, _defaultAdmin);
        _setupRole(METADATA_ROLE, _defaultAdmin);
    }

    /*//////////////////////////////////////////////////////////////
                            ERC165 Logic
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev See ERC165: https://eips.ethereum.org/EIPS/eip-165
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, IERC165) returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165 Interface ID for ERC165
            interfaceId == 0xd9b67a26 || // ERC165 Interface ID for ERC1155
            interfaceId == 0x0e89341c || // ERC165 Interface ID for ERC1155MetadataURI
            interfaceId == type(IERC2981).interfaceId; // ERC165 ID for ERC2981
    }

    /*///////////////////////////////////////////////////////////////
                    Overriden metadata logic
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice         Returns the metadata URI for an NFT.
     * @dev            See `BatchMintMetadata` for handling of metadata in this contract.
     *
     * @param _tokenId The tokenId of an NFT.
     * @return         The metadata URI for the given NFT.
     */
    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        return _uri[_tokenId];
    }

    /// @notice The tokenId assigned to the next new NFT to be lazy minted.
    function nextTokenIdToMint() public view virtual returns (uint256) {
        return nextTokenIdToMint_;
    }

    /*///////////////////////////////////////////////////////////////
                    Signature claiming logic
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice mints 1 token to each of the recipients in the request.
     *  @dev    Only an account holding MINTER_ROLE can sign claim requests.
     *
     *  @param _req The payload / mint request.
     *  @param _signature The signature produced by an account signing the request.
     * 
     */
    function mintWithSignature(
        Request calldata _req,
        bytes calldata _signature
    ) external override returns (address signer) {

        // verify and process payload.
        signer = _processRequest(_req, _signature);
 
        // get the tokenId to mint
        uint256 tokenIdToMint = nextTokenIdToMint_;
        nextTokenIdToMint_ += 1;

        // set the tokenURI
        _setTokenURI(tokenIdToMint, _req.tokenURI);

        // mint amount of tokens according to amount array, to each address in the targetAddresses array
        for (uint256 i = 0; i < _req.targetAddresses.length; i++) {
            _mint(_req.targetAddresses[i], tokenIdToMint, _req.amounts[i], "");
        }

        // emit the event
        emit TokensMintedWithSignature(signer, _req.targetAddresses, tokenIdToMint, _req.amounts );
    }


    /**
     *  @notice Burns a given qty of the requestor's balance the requested tokenId
     *  @dev    Only an account holding MINTER_ROLE can sign requests.
     *
     *  @param req The burn request.
     *  @param signature The signature produced by an account signing the request.
     * 
     */
    function burnWithSignature(
        Request calldata req,
        bytes calldata signature
    ) external override returns (address signer) {

        // revert if the arrays are not the same length
        if (req.targetAddresses.length != req.amounts.length) {
            revert("Length mismatch");
        }

        // verify and process payload.
        signer = _processRequest(req, signature);

        // burn the tokens
        for (uint256 i = 0; i < req.targetAddresses.length; i++) {
            _burn(req.targetAddresses[i], req.tokenId, req.amounts[i]);
        }

        // emit the event
        emit TokensBurnedWithSignature(signer, req.targetAddresses, req.tokenId, req.amounts);

    }

    /*///////////////////////////////////////////////////////////////
                        Internal functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Runs before every token transfer / mint / burn.
     *
     * @param operator The address performing the token transfer.
     * @param from     The address from which the token is being transferred.
     * @param to       The address to which the token is being transferred.
     * @param ids      The tokenIds of the tokens being transferred.
     * @param amounts  The amounts of the tokens being transferred.
     * @param data     Any additional data being passed in the token transfer.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                totalSupply[ids[i]] += amounts[i];
            }
        }

        if (to == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                totalSupply[ids[i]] -= amounts[i];
            }
        }
    }

    /// @dev Checks whether royalty info can be set in the given execution context.
    function _canSetRoyaltyInfo() internal view virtual override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Checks whether contract metadata can be set in the given execution context.
    function _canSetContractURI() internal view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Returns whether a given address is authorized to sign claim requests.
    function _canSignRequest(address _signer) internal view virtual override returns (bool) {
        return hasRole(MINTER_ROLE, _signer);
    }
}