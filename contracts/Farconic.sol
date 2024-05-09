// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @author thirdweb, modified by Q - https://warpcast.com/berlin

import { ERC1155 } from "@thirdweb-dev/contracts/eip/ERC1155.sol";
import "@thirdweb-dev/contracts/extension/ContractMetadata.sol";
import "@thirdweb-dev/contracts/extension/Royalty.sol";
import "@thirdweb-dev/contracts/extension/BatchMintMetadata.sol";
import "@thirdweb-dev/contracts/extension/PrimarySale.sol";
import "@thirdweb-dev/contracts/extension/LazyMint.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";
import "@thirdweb-dev/contracts/extension/Multicall.sol";
import "@thirdweb-dev/contracts/lib/Strings.sol";
import { CurrencyTransferLib } from "@thirdweb-dev/contracts/lib/CurrencyTransferLib.sol";
import "./CitiesSignatureClaim.sol";
import "./AllowList.sol";

/**
 *      BASE:      ERC1155Base
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
 *  The `ERC721Drop` contract lets you lazy mint tokens, and distribute those lazy minted tokens via the drop mechanism.
 */

contract Farconic is
    ERC1155,
    ContractMetadata,
    Royalty,
    BatchMintMetadata,
    PrimarySale,
    AllowList,
    LazyMint,
    PermissionsEnumerable,
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

    /// @notice Emitted when tokens are claimed.
    event TokensClaimed(
        address indexed claimer,
        address indexed receiver,
        uint256 tokenId,
        uint256 quantityClaimed
    );

    /*///////////////////////////////////////////////////////////////
                            State variables
    //////////////////////////////////////////////////////////////*/

    /// @dev the price & currency for claiming tokens
    uint16 public freeClaimThreshold = 10;
    uint16 public allowListedClaimThreshold = 100;
    uint256 public price = 0 ether;
    uint256 public allowListPrice = 0 ether;
    address public currency = CurrencyTransferLib.NATIVE_TOKEN;

    /// @dev the maximum number of tokens that can be claimed using the claimRandomBatch function
    uint256 public maxBatchClaimSize = 10;

    /// @dev Only MINTER_ROLE holders can sign off on `ClaimRequests and lazy mint tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @dev Only METADATA_ROLE holders can reveal the URI for a batch of delayed reveal NFTs, and update or freeze batch metadata.
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");

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

    /// @notice Keeps track of how many tokens a given address has claimed.
    mapping(address => uint256) public claimedTokens;

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

    /**
     * @notice Sets the price for claiming a token
     *
     * @param _price the price in wei to claim a token
     */
    function setPrice(uint256 _price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        price = _price;
    }

    /**
     * @notice Sets the price for an allow-listed address to claim a token
     *
     * @param _price the price in wei for an allow-listed address to claim a token
     */
    function setAllowListPrice(uint256 _price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowListPrice = _price;
    }

    /**
     * @notice Sets the currency for claiming a token
     *
     * @param _currency the currency to pay for claiming a token
     */
    function setCurrency(address _currency) external onlyRole(DEFAULT_ADMIN_ROLE) {
        currency = _currency;
    }

    /**
     * @notice Sets the free claim threshold
     *
     * @param _threshold the threshold for free claims
     */
    function setFreeClaimThreshold(uint16 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        freeClaimThreshold = _threshold;
    }

    /**
     * @notice Sets the allow-listed claim threshold
     *
     * @param _threshold the threshold for allow-listed claims
     */
    function setAllowListedClaimThreshold(uint16 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowListedClaimThreshold = _threshold;
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
        uint256 _quantity
    ) public payable {

        if (_tokenId >= nextTokenIdToLazyMint) {
            revert InvalidId();
        }

        // Determine the price
        uint256 _price = claimedTokens[msg.sender] <= freeClaimThreshold
            ? 0
            : isAllowListed(msg.sender) || hasAllowListedBalance(msg.sender)
                ? claimedTokens[msg.sender] <= allowListedClaimThreshold
                    ? allowListPrice
                    : price
                : price;

        // If there's a price, collect price.
        collectPriceOnClaim(_tokenId, _price, address(0), _quantity);

        // Mint the relevant NFTs to claimer.
        _mint(_receiver, _tokenId, _quantity, "");

        // Run after-claim logic.
        claimedTokens[_receiver] += _quantity;

        emit TokensClaimed(msg.sender, _receiver, _tokenId, _quantity);

    }

    /// @dev Lets an account claim a batch of tokens
    /// @notice the tokens must have the same pricing and allowList
    function claimRandomBatch(
        uint8 _batchSize,
        uint16 _min,
        uint16 _max,
        address _receiver
    ) public payable {

        if (_batchSize > maxBatchClaimSize) {
            revert MaxExceeded();
        }

        uint16[] memory tokenIds = getRandomNumbers(_min, _max, _batchSize);

        for(uint8 i = 0; i < tokenIds.length; i++){
            claim(_receiver, tokenIds[i], 1);
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
    ) external override returns (address signer) {

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
        _mint(_req.to, _req.outTokenId, 1, "");
 
        emit TokensClaimedWithSignature(signer, _req.to, _req.outTokenId, _req);
    }

    /*///////////////////////////////////////////////////////////////
                        Internal functions
    //////////////////////////////////////////////////////////////*/

    function getRandomNumbers(uint16 min, uint16 max, uint8 count) internal view returns (uint16[] memory) {
        require(max >= min, "Invalid range");
        require(count > 0, "Count must be greater than zero");

        // Initialize the array to store random numbers
        uint16[] memory randomNumbers = new uint16[](count);

        // Calculate the seed
        uint256 seed = uint256(keccak256(abi.encodePacked(
            tx.origin,
            blockhash(block.number - 1),
            block.timestamp
        )));

        // Generate random numbers and fill the array
        for (uint8 i = 0; i < count; i++) {
            // Use modulo operation to get a random number within the range
            randomNumbers[i] = uint16(min + (seed % (max - min + 1)));
            // Update the seed for the next iteration
            seed = uint256(keccak256(abi.encodePacked(seed)));
        }

        return randomNumbers;
    }

    /**
     * @dev Collects and distributes the primary sale value of NFTs being claimed.
     *
     * @param _tokenId              The tokenId of the NFT being claimed.
     * @param _price                The price of the NFT being claimed.
     * @param _primarySaleRecipient The address to which primary sale revenue should be sent.
     * @param _quantityToClaim      The quantity of NFTs being claimed.
     */
    function collectPriceOnClaim(
        uint256 _tokenId,
        uint256 _price,
        address _primarySaleRecipient,
        uint256 _quantityToClaim
    ) internal {
        if (_price == 0) {
            if (msg.value > 0) {
                revert CurrencyTransferLib.CurrencyTransferLibMismatchedValue(0, msg.value);
            }
            return;
        }

        address _saleRecipient = _primarySaleRecipient == address(0)
            ? (saleRecipient[_tokenId] == address(0) ? primarySaleRecipient() : saleRecipient[_tokenId])
            : _primarySaleRecipient;

        uint256 totalPrice = _quantityToClaim * _price;

        bool validMsgValue;
        if (currency == CurrencyTransferLib.NATIVE_TOKEN) {
            validMsgValue = msg.value == totalPrice;
        } else {
            validMsgValue = msg.value == 0;
        }
        if(!validMsgValue) {
            revert CurrencyTransferLib.CurrencyTransferLibMismatchedValue(totalPrice, msg.value);
        }

        CurrencyTransferLib.transferCurrency(currency, msg.sender, _saleRecipient, totalPrice);
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

    /// @dev Returns whether lazy minting can be done in the given execution context.
    function _canLazyMint() internal view virtual override returns (bool) {
        return hasRole(MINTER_ROLE, msg.sender);
    }

    /// @dev Returns whether a given address is authorized to sign claim requests.
    function _canSignClaimRequest(address _signer) internal view virtual override returns (bool) {
        return hasRole(MINTER_ROLE, _signer);
    }

    /// @dev Returns whether a given address is authorized to modify the allowList.
    function _canModifyAllowList() internal view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
