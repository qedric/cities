// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

import { ERC1155 } from "@thirdweb-dev/contracts/eip/ERC1155.sol";

import "@thirdweb-dev/contracts/extension/ContractMetadata.sol";
import "@thirdweb-dev/contracts/extension/Royalty.sol";
import "@thirdweb-dev/contracts/extension/BatchMintMetadata.sol";
import "@thirdweb-dev/contracts/extension/PrimarySale.sol";
import "@thirdweb-dev/contracts/extension/LazyMint.sol";
import "@thirdweb-dev/contracts/extension/Drop1155.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";
import "@thirdweb-dev/contracts/extension/Multicall.sol";
import "@thirdweb-dev/contracts/lib/Strings.sol";
import { CurrencyTransferLib } from "@thirdweb-dev/contracts/lib/CurrencyTransferLib.sol";
import "./CitiesSignatureClaim.sol";

/**
 *      BASE:      ERC1155Base
 *      EXTENSION: DropSinglePhase1155
 *
 *  The `ERC1155Base` smart contract implements the ERC1155 NFT standard.
 *  It includes the following additions to standard ERC1155 logic:
 *
 *      - Contract metadata for royalty support on platforms such as OpenSea that use
 *        off-chain information to distribute roaylties.
 *
 *      - Ownership of the contract, with the ability to restrict certain functions to
 *        only be called by the contract's owner.
 *
 *      - Multicall capability to perform multiple actions atomically
 *
 *      - EIP 2981 compliance for royalty support on NFT marketplaces.
 *
 *  The `drop` mechanism in the `DropSinglePhase1155` extension is a distribution mechanism for lazy minted tokens. It lets
 *  you set restrictions such as a price to charge, an allowlist etc. when an address atttempts to mint lazy minted tokens.
 *
 *  The `ERC721Drop` contract lets you lazy mint tokens, and distribute those lazy minted tokens via the drop mechanism.
 */

contract Cities is
    ERC1155,
    ContractMetadata,
    Royalty,
    BatchMintMetadata,
    PrimarySale,
    LazyMint,
    PermissionsEnumerable,
    Drop1155,
    CitiesSignatureClaim,
    Multicall
{
    using Strings for uint256;

    /// @dev The sender is not authorized to perform the action
    error Unauthorized();

    /// @dev not enough tokens in wallet to perform the action
    error InsufficientBalance();

    /// @dev token id provided is invalid
    error InvalidId();

    /// @dev The value is higher than allowed
    error MaxExceeded();

    /*///////////////////////////////////////////////////////////////
                            State variables
    //////////////////////////////////////////////////////////////*/

    /// @dev Only MINTER_ROLE holders can sign off on `ClaimRequests and lazy mint tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @dev Only METADATA_ROLE holders can reveal the URI for a batch of delayed reveal NFTs, and update or freeze batch metadata.
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");

    /// @dev the maximum number of tokens that can be claimed in a single batch
    uint8 public maxBatchClaimSize = 10;

    function contractType() external pure returns (bytes32) {
        return bytes32("DropERC1155");
    }

    /*//////////////////////////////////////////////////////////////
                        Mappings
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Returns the total supply of NFTs of a given tokenId
     *  @dev Mapping from tokenId => total circulating supply of NFTs of that tokenId.
     */
    mapping(uint256 => uint256) public totalSupply;

    /// @dev Mapping from token ID => the address of the recipient of primary sales.
    mapping(uint256 => address) public saleRecipient;

    /*///////////////////////////////////////////////////////////////
                               Events
    //////////////////////////////////////////////////////////////*/

    /// @dev Emitted when the sale recipient for a particular tokenId is updated.
    event SaleRecipientForTokenUpdated(uint256 indexed tokenId, address saleRecipient);

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
     * @param _primarySaleRecipient The address to which primary sale revenue should be sent.
     */
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient
    ) ERC1155(_name, _symbol) {
        
        _setupDefaultRoyaltyInfo(_royaltyRecipient, _royaltyBps);
        _setupPrimarySaleRecipient(_primarySaleRecipient);

        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(MINTER_ROLE, _defaultAdmin);
        _setupRole(METADATA_ROLE, _defaultAdmin);
    }

     /*///////////////////////////////////////////////////////////////
                        Setter functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets a contract admin set the recipient for all primary sales.
    function setSaleRecipientForToken(uint256 _tokenId, address _saleRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        saleRecipient[_tokenId] = _saleRecipient;
        emit SaleRecipientForTokenUpdated(_tokenId, _saleRecipient);
    }

    /**
     * @notice Updates the base URI for a batch of tokens.
     *
     * @param _index Index of the desired batch in batchIds array.
     * @param _uri   the new base URI for the batch.
     */
    function updateBatchBaseURI(uint256 _index, string calldata _uri) external onlyRole(METADATA_ROLE) {
        _setBaseURI(getBatchIdAtIndex(_index), _uri);
    }

    /**
     * @notice Freezes the base URI for a batch of tokens.
     *
     * @param _index Index of the desired batch in batchIds array.
     */
    function freezeBatchBaseURI(uint256 _index) external onlyRole(METADATA_ROLE) {
        _freezeBaseURI(getBatchIdAtIndex(_index));
    }

    /**
     * @notice Sets the maximum number of tokens that can be claimed in a single batch
     *
     * @param max the maximum number of tokens allowed to be claimed at once
     */
    function setMaxClaimBatchSize(uint8 max) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxBatchClaimSize = max;
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

    /*//////////////////////////////////////////////////////////////
                        Minting/burning logic
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice         Lets an owner or approved operator burn NFTs of the given tokenId.
     *
     *  @param _owner   The owner of the NFT to burn.
     *  @param _tokenId The tokenId of the NFT to burn.
     *  @param _amount  The amount of the NFT to burn.
     */
    function burn(address _owner, uint256 _tokenId, uint256 _amount) external virtual {

        if(msg.sender != _owner || !isApprovedForAll[_owner][msg.sender]) {
            revert Unauthorized();
        }

        _burn(_owner, _tokenId, _amount);
    }

    /**
     *  @notice         Lets an owner or approved operator burn NFTs of the given tokenIds.
     *
     *  @param _owner    The owner of the NFTs to burn.
     *  @param _tokenIds The tokenIds of the NFTs to burn.
     *  @param _amounts  The amounts of the NFTs to burn.
     */
    function burnBatch(address _owner, uint256[] memory _tokenIds, uint256[] memory _amounts) external virtual {

        if(msg.sender != _owner || !isApprovedForAll[_owner][msg.sender]) {
            revert Unauthorized();
        }

        _burnBatch(_owner, _tokenIds, _amounts);
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
        return string(abi.encodePacked(_getBaseURI(_tokenId), _tokenId.toString()));
    }

    /// @notice The tokenId assigned to the next new NFT to be lazy minted.
    function nextTokenIdToMint() public view virtual returns (uint256) {
        return nextTokenIdToLazyMint;
    }

    /*///////////////////////////////////////////////////////////////
                       claim logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets an account claim tokens.
    /// @notice admin restricted
    function claim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data
    ) public payable override onlyRole(DEFAULT_ADMIN_ROLE){
        super.claim(_receiver, _tokenId, _quantity, _currency, _pricePerToken, _allowlistProof, _data);
    }

    /// @dev Lets an account claim a batch of tokens
    /// @notice the tokens must have the same pricing and allowList
    function claimRandomBatch(
        uint8 _batchSize,
        uint256 _min,
        uint256 _max,
        address _receiver,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data
    ) public payable {

        if (_batchSize > maxBatchClaimSize) {
            revert MaxExceeded();
        }

        uint8[] memory tokenIds = getRandomNumbers(_min, _max, _batchSize);

        for(uint i = 0; i < tokenIds.length; i++){
            _beforeClaim(tokenIds[i], _receiver, 1, _currency, _pricePerToken, _allowlistProof, _data);

            uint256 activeConditionId = getActiveClaimConditionId(tokenIds[i]);

            verifyClaim(
                activeConditionId,
                _dropMsgSender(),
                tokenIds[i],
                1,
                _currency,
                _pricePerToken,
                _allowlistProof
            );

            // Update contract state.
            claimCondition[tokenIds[i]].conditions[activeConditionId].supplyClaimed += 1;
            claimCondition[tokenIds[i]].supplyClaimedByWallet[activeConditionId][_dropMsgSender()] += 1;

            // If there's a price, collect price.
            collectPriceOnClaim(tokenIds[i], address(0), 1, _currency, _pricePerToken);

            // Mint the relevant NFTs to claimer.
            transferTokensOnClaim(_receiver, tokenIds[i], 1);

            emit TokensClaimed(activeConditionId, _dropMsgSender(), _receiver, tokenIds[i], 1);

            _afterClaim(tokenIds[i], _receiver, 1, _currency, _pricePerToken, _allowlistProof, _data);
        }
    }

    /*///////////////////////////////////////////////////////////////
                    Signature claiming logic
    //////////////////////////////////////////////////////////////*/

    /**
     *  @notice Claims a token and burns the provided input tokens.
     *  @dev    Only an account holding MINTER_ROLE can sign claim requests.
     *
     *  @param _req The payload / claim request.
     *  @param _signature The signature produced by an account signing the request.
     * 
     * struct ClaimRequest {
        address to;
        uint256[] inTokenIds;
        uint256 outTokenId;
        uint128 validityStartTimestamp;
        uint128 validityEndTimestamp;
        bytes32 uid;
    }
     * 
     */
    function claimWithSignature(
        ClaimRequest calldata _req,
        bytes calldata _signature
    ) external payable override returns (address signer){

        if(_req.outTokenId >= nextTokenIdToMint()) {
            revert InvalidId();
        }

        // verify and process payload.
        signer = _processRequest(_req, _signature);

        // check that the receiver owns all tokens in inTokenIds, then burn 'em
        for (uint256 i = 0; i < _req.inTokenIds.length; i += 1) {
            if (balanceOf[_req.to][_req.inTokenIds[i]] == 0) {
                revert InsufficientBalance();
            }
            _burn(_req.to, _req.inTokenIds[i], 1);
        }
 
        // claim output token
        transferTokensOnClaim(_req.to, _req.outTokenId, 1);
 
        emit TokensClaimedWithSignature(signer, _req.to, _req.outTokenId, _req);
    }

    /*///////////////////////////////////////////////////////////////
                        Internal functions
    //////////////////////////////////////////////////////////////*/

    function getRandomNumbers(uint256 min, uint256 max, uint8 count) internal view returns (uint8[] memory) {
        require(max >= min, "Invalid range");
        require(count > 0, "Count must be greater than zero");

        // Initialize the array to store random numbers
        uint8[] memory randomNumbers = new uint8[](count);

        // Calculate the seed using block timestamp and gasleft
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, gasleft())));

        // Generate random numbers and fill the array
        for (uint8 i = 0; i < count; i++) {
            // Use modulo operation to get a random number within the range
            randomNumbers[i] = uint8(min + (seed % (max - min + 1)));
            // Update the seed for the next iteration
            seed = uint256(keccak256(abi.encodePacked(seed)));
        }

        return randomNumbers;
    }

    /**
     * @dev Runs before every `claim` function call.
     *
     * @param _tokenId The tokenId of the NFT being claimed.
     */
    function _beforeClaim(
        uint256 _tokenId,
        address,
        uint256,
        address,
        uint256,
        AllowlistProof calldata,
        bytes memory
    ) internal view virtual override {
        if (_tokenId >= nextTokenIdToLazyMint) {
            revert InvalidId();
        }
    }

    /// @dev Runs after every `claim` function call.
    function _afterClaim(
        uint256 _tokenId,
        address _receiver,
        uint256 _quantity,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data
    ) internal override {
    }

    /**
     * @dev Collects and distributes the primary sale value of NFTs being claimed.
     *
     * @param _primarySaleRecipient The address to which primary sale revenue should be sent.
     * @param _quantityToClaim      The quantity of NFTs being claimed.
     * @param _currency             The currency in which the NFTs are being sold.
     * @param _pricePerToken        The price per NFT being claimed.
     */
    function collectPriceOnClaim(
        uint256 _tokenId,
        address _primarySaleRecipient,
        uint256 _quantityToClaim,
        address _currency,
        uint256 _pricePerToken
    ) internal override {
        if (_pricePerToken == 0) {
            if (msg.value > 0) {
                revert CurrencyTransferLib.CurrencyTransferLibMismatchedValue(0, msg.value);
            }
            return;
        }

        address _saleRecipient = _primarySaleRecipient == address(0)
            ? (saleRecipient[_tokenId] == address(0) ? primarySaleRecipient() : saleRecipient[_tokenId])
            : _primarySaleRecipient;

        uint256 totalPrice = _quantityToClaim * _pricePerToken;

        bool validMsgValue;
        if (_currency == CurrencyTransferLib.NATIVE_TOKEN) {
            validMsgValue = msg.value == totalPrice;
        } else {
            validMsgValue = msg.value == 0;
        }
        if(!validMsgValue) {
            revert CurrencyTransferLib.CurrencyTransferLibMismatchedValue(totalPrice, msg.value);
        }

        CurrencyTransferLib.transferCurrency(_currency, msg.sender, _saleRecipient, totalPrice);
    }

    /**
     * @dev Transfers the NFTs being claimed.
     *
     * @param _to                    The address to which the NFTs are being transferred.
     * @param _tokenId               The tokenId of the NFTs being claimed.
     * @param _quantityBeingClaimed  The quantity of NFTs being claimed.
     */
    function transferTokensOnClaim(
        address _to,
        uint256 _tokenId,
        uint256 _quantityBeingClaimed
    ) internal override {
        _mint(_to, _tokenId, _quantityBeingClaimed, "");
    }

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

    /// @dev Checks whether primary sale recipient can be set in the given execution context.
    function _canSetPrimarySaleRecipient() internal view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Checks whether royalty info can be set in the given execution context.
    function _canSetRoyaltyInfo() internal view virtual override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Checks whether contract metadata can be set in the given execution context.
    function _canSetContractURI() internal view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Checks whether platform fee info can be set in the given execution context.
    function _canSetClaimConditions() internal view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Returns whether lazy minting can be done in the given execution context.
    function _canLazyMint() internal view virtual override returns (bool) {
        return hasRole(MINTER_ROLE, msg.sender);
    }

    /// @dev Checks whether NFTs can be revealed in the given execution context.
    function _canReveal() internal view virtual returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Returns whether a given address is authorized to sign claim requests.
    function _canSignClaimRequest(address _signer) internal view virtual override returns (bool) {
        return hasRole(MINTER_ROLE, _signer);
    }
}
