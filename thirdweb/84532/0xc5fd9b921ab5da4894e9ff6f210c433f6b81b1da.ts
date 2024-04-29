import {
  prepareEvent,
  prepareContractCall,
  readContract,
  type BaseTransactionOptions,
  type AbiParameterToPrimitiveType,
} from "thirdweb";

/**
* Contract events
*/

/**
 * Represents the filters for the "ApprovalForAll" event.
 */
export type ApprovalForAllEventFilters = Partial<{
  _owner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_owner","type":"address"}>
_operator: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_operator","type":"address"}>
}>;

/**
 * Creates an event object for the ApprovalForAll event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { approvalForAllEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  approvalForAllEvent({
 *  _owner: ...,
 *  _operator: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function approvalForAllEvent(filters: ApprovalForAllEventFilters = {}) {
  return prepareEvent({
    signature: "event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)",
    filters,
  });
};
  



/**
 * Creates an event object for the BatchMetadataUpdate event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { batchMetadataUpdateEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  batchMetadataUpdateEvent()
 * ],
 * });
 * ```
 */ 
export function batchMetadataUpdateEvent() {
  return prepareEvent({
    signature: "event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId)",
  });
};
  

/**
 * Represents the filters for the "ClaimConditionsUpdated" event.
 */
export type ClaimConditionsUpdatedEventFilters = Partial<{
  tokenId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}>
}>;

/**
 * Creates an event object for the ClaimConditionsUpdated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { claimConditionsUpdatedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  claimConditionsUpdatedEvent({
 *  tokenId: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function claimConditionsUpdatedEvent(filters: ClaimConditionsUpdatedEventFilters = {}) {
  return prepareEvent({
    signature: "event ClaimConditionsUpdated(uint256 indexed tokenId, (uint256 startTimestamp, uint256 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityLimitPerWallet, bytes32 merkleRoot, uint256 pricePerToken, address currency, string metadata)[] claimConditions, bool resetEligibility)",
    filters,
  });
};
  



/**
 * Creates an event object for the ContractURIUpdated event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { contractURIUpdatedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  contractURIUpdatedEvent()
 * ],
 * });
 * ```
 */ 
export function contractURIUpdatedEvent() {
  return prepareEvent({
    signature: "event ContractURIUpdated(string prevURI, string newURI)",
  });
};
  

/**
 * Represents the filters for the "DefaultRoyalty" event.
 */
export type DefaultRoyaltyEventFilters = Partial<{
  newRoyaltyRecipient: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"newRoyaltyRecipient","type":"address"}>
}>;

/**
 * Creates an event object for the DefaultRoyalty event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { defaultRoyaltyEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  defaultRoyaltyEvent({
 *  newRoyaltyRecipient: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function defaultRoyaltyEvent(filters: DefaultRoyaltyEventFilters = {}) {
  return prepareEvent({
    signature: "event DefaultRoyalty(address indexed newRoyaltyRecipient, uint256 newRoyaltyBps)",
    filters,
  });
};
  



/**
 * Creates an event object for the MetadataFrozen event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { metadataFrozenEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  metadataFrozenEvent()
 * ],
 * });
 * ```
 */ 
export function metadataFrozenEvent() {
  return prepareEvent({
    signature: "event MetadataFrozen()",
  });
};
  

/**
 * Represents the filters for the "PrimarySaleRecipientUpdated" event.
 */
export type PrimarySaleRecipientUpdatedEventFilters = Partial<{
  recipient: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"recipient","type":"address"}>
}>;

/**
 * Creates an event object for the PrimarySaleRecipientUpdated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { primarySaleRecipientUpdatedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  primarySaleRecipientUpdatedEvent({
 *  recipient: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function primarySaleRecipientUpdatedEvent(filters: PrimarySaleRecipientUpdatedEventFilters = {}) {
  return prepareEvent({
    signature: "event PrimarySaleRecipientUpdated(address indexed recipient)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoleAdminChanged" event.
 */
export type RoleAdminChangedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"}>
previousAdminRole: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"}>
newAdminRole: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}>
}>;

/**
 * Creates an event object for the RoleAdminChanged event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { roleAdminChangedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  roleAdminChangedEvent({
 *  role: ...,
 *  previousAdminRole: ...,
 *  newAdminRole: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function roleAdminChangedEvent(filters: RoleAdminChangedEventFilters = {}) {
  return prepareEvent({
    signature: "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoleGranted" event.
 */
export type RoleGrantedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"account","type":"address"}>
sender: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"sender","type":"address"}>
}>;

/**
 * Creates an event object for the RoleGranted event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { roleGrantedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  roleGrantedEvent({
 *  role: ...,
 *  account: ...,
 *  sender: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function roleGrantedEvent(filters: RoleGrantedEventFilters = {}) {
  return prepareEvent({
    signature: "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoleRevoked" event.
 */
export type RoleRevokedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"account","type":"address"}>
sender: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"sender","type":"address"}>
}>;

/**
 * Creates an event object for the RoleRevoked event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { roleRevokedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  roleRevokedEvent({
 *  role: ...,
 *  account: ...,
 *  sender: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function roleRevokedEvent(filters: RoleRevokedEventFilters = {}) {
  return prepareEvent({
    signature: "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoyaltyForToken" event.
 */
export type RoyaltyForTokenEventFilters = Partial<{
  tokenId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}>
royaltyRecipient: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"royaltyRecipient","type":"address"}>
}>;

/**
 * Creates an event object for the RoyaltyForToken event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { royaltyForTokenEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  royaltyForTokenEvent({
 *  tokenId: ...,
 *  royaltyRecipient: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function royaltyForTokenEvent(filters: RoyaltyForTokenEventFilters = {}) {
  return prepareEvent({
    signature: "event RoyaltyForToken(uint256 indexed tokenId, address indexed royaltyRecipient, uint256 royaltyBps)",
    filters,
  });
};
  

/**
 * Represents the filters for the "SaleRecipientForTokenUpdated" event.
 */
export type SaleRecipientForTokenUpdatedEventFilters = Partial<{
  tokenId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}>
}>;

/**
 * Creates an event object for the SaleRecipientForTokenUpdated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { saleRecipientForTokenUpdatedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  saleRecipientForTokenUpdatedEvent({
 *  tokenId: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function saleRecipientForTokenUpdatedEvent(filters: SaleRecipientForTokenUpdatedEventFilters = {}) {
  return prepareEvent({
    signature: "event SaleRecipientForTokenUpdated(uint256 indexed tokenId, address saleRecipient)",
    filters,
  });
};
  

/**
 * Represents the filters for the "TokensClaimed" event.
 */
export type TokensClaimedEventFilters = Partial<{
  claimConditionIndex: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"claimConditionIndex","type":"uint256"}>
claimer: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"claimer","type":"address"}>
receiver: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"receiver","type":"address"}>
}>;

/**
 * Creates an event object for the TokensClaimed event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { tokensClaimedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  tokensClaimedEvent({
 *  claimConditionIndex: ...,
 *  claimer: ...,
 *  receiver: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function tokensClaimedEvent(filters: TokensClaimedEventFilters = {}) {
  return prepareEvent({
    signature: "event TokensClaimed(uint256 indexed claimConditionIndex, address indexed claimer, address indexed receiver, uint256 tokenId, uint256 quantityClaimed)",
    filters,
  });
};
  

/**
 * Represents the filters for the "TokensClaimedWithSignature" event.
 */
export type TokensClaimedWithSignatureEventFilters = Partial<{
  signer: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"signer","type":"address"}>
recipient: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"recipient","type":"address"}>
tokenIdClaimed: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"tokenIdClaimed","type":"uint256"}>
}>;

/**
 * Creates an event object for the TokensClaimedWithSignature event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { tokensClaimedWithSignatureEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  tokensClaimedWithSignatureEvent({
 *  signer: ...,
 *  recipient: ...,
 *  tokenIdClaimed: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function tokensClaimedWithSignatureEvent(filters: TokensClaimedWithSignatureEventFilters = {}) {
  return prepareEvent({
    signature: "event TokensClaimedWithSignature(address indexed signer, address indexed recipient, uint256 indexed tokenIdClaimed, (address to, uint256[] inTokenIds, uint256 outTokenId, uint128 validityStartTimestamp, uint128 validityEndTimestamp, bytes32 uid) claimRequest)",
    filters,
  });
};
  

/**
 * Represents the filters for the "TokensLazyMinted" event.
 */
export type TokensLazyMintedEventFilters = Partial<{
  startTokenId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"startTokenId","type":"uint256"}>
}>;

/**
 * Creates an event object for the TokensLazyMinted event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { tokensLazyMintedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  tokensLazyMintedEvent({
 *  startTokenId: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function tokensLazyMintedEvent(filters: TokensLazyMintedEventFilters = {}) {
  return prepareEvent({
    signature: "event TokensLazyMinted(uint256 indexed startTokenId, uint256 endTokenId, string baseURI, bytes encryptedBaseURI)",
    filters,
  });
};
  

/**
 * Represents the filters for the "TransferBatch" event.
 */
export type TransferBatchEventFilters = Partial<{
  _operator: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_operator","type":"address"}>
_from: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_from","type":"address"}>
_to: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_to","type":"address"}>
}>;

/**
 * Creates an event object for the TransferBatch event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { transferBatchEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  transferBatchEvent({
 *  _operator: ...,
 *  _from: ...,
 *  _to: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function transferBatchEvent(filters: TransferBatchEventFilters = {}) {
  return prepareEvent({
    signature: "event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values)",
    filters,
  });
};
  

/**
 * Represents the filters for the "TransferSingle" event.
 */
export type TransferSingleEventFilters = Partial<{
  _operator: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_operator","type":"address"}>
_from: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_from","type":"address"}>
_to: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"_to","type":"address"}>
}>;

/**
 * Creates an event object for the TransferSingle event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { transferSingleEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  transferSingleEvent({
 *  _operator: ...,
 *  _from: ...,
 *  _to: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function transferSingleEvent(filters: TransferSingleEventFilters = {}) {
  return prepareEvent({
    signature: "event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)",
    filters,
  });
};
  

/**
 * Represents the filters for the "URI" event.
 */
export type URIEventFilters = Partial<{
  _id: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"_id","type":"uint256"}>
}>;

/**
 * Creates an event object for the URI event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { uRIEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  uRIEvent({
 *  _id: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function uRIEvent(filters: URIEventFilters = {}) {
  return prepareEvent({
    signature: "event URI(string _value, uint256 indexed _id)",
    filters,
  });
};
  

/**
* Contract read functions
*/



/**
 * Calls the "DEFAULT_ADMIN_ROLE" function on the contract.
 * @param options - The options for the DEFAULT_ADMIN_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { DEFAULT_ADMIN_ROLE } from "TODO";
 * 
 * const result = await DEFAULT_ADMIN_ROLE();
 * 
 * ```
 */
export async function DEFAULT_ADMIN_ROLE(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xa217fddf",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "METADATA_ROLE" function on the contract.
 * @param options - The options for the METADATA_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { METADATA_ROLE } from "TODO";
 * 
 * const result = await METADATA_ROLE();
 * 
 * ```
 */
export async function METADATA_ROLE(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x38841782",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "MINTER_ROLE" function on the contract.
 * @param options - The options for the MINTER_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { MINTER_ROLE } from "TODO";
 * 
 * const result = await MINTER_ROLE();
 * 
 * ```
 */
export async function MINTER_ROLE(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xd5391393",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "balanceOf" function.
 */
export type BalanceOfParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "balanceOf" function on the contract.
 * @param options - The options for the balanceOf function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { balanceOf } from "TODO";
 * 
 * const result = await balanceOf({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 * 
 * ```
 */
export async function balanceOf(
  options: BaseTransactionOptions<BalanceOfParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x00fdd58e",
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};


/**
 * Represents the parameters for the "balanceOfBatch" function.
 */
export type BalanceOfBatchParams = {
  accounts: AbiParameterToPrimitiveType<{"internalType":"address[]","name":"accounts","type":"address[]"}>
ids: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"ids","type":"uint256[]"}>
};

/**
 * Calls the "balanceOfBatch" function on the contract.
 * @param options - The options for the balanceOfBatch function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { balanceOfBatch } from "TODO";
 * 
 * const result = await balanceOfBatch({
 *  accounts: ...,
 *  ids: ...,
 * });
 * 
 * ```
 */
export async function balanceOfBatch(
  options: BaseTransactionOptions<BalanceOfBatchParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x4e1273f4",
  [
    {
      "internalType": "address[]",
      "name": "accounts",
      "type": "address[]"
    },
    {
      "internalType": "uint256[]",
      "name": "ids",
      "type": "uint256[]"
    }
  ],
  [
    {
      "internalType": "uint256[]",
      "name": "",
      "type": "uint256[]"
    }
  ]
],
    params: [options.accounts, options.ids]
  });
};


/**
 * Represents the parameters for the "batchFrozen" function.
 */
export type BatchFrozenParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "batchFrozen" function on the contract.
 * @param options - The options for the batchFrozen function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { batchFrozen } from "TODO";
 * 
 * const result = await batchFrozen({
 *  arg_0: ...,
 * });
 * 
 * ```
 */
export async function batchFrozen(
  options: BaseTransactionOptions<BatchFrozenParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x83040532",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "claimCondition" function.
 */
export type ClaimConditionParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "claimCondition" function on the contract.
 * @param options - The options for the claimCondition function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { claimCondition } from "TODO";
 * 
 * const result = await claimCondition({
 *  arg_0: ...,
 * });
 * 
 * ```
 */
export async function claimCondition(
  options: BaseTransactionOptions<ClaimConditionParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xe9703d25",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "currentStartId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "count",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0]
  });
};




/**
 * Calls the "contractType" function on the contract.
 * @param options - The options for the contractType function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { contractType } from "TODO";
 * 
 * const result = await contractType();
 * 
 * ```
 */
export async function contractType(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xcb2ef6f7",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "contractURI" function on the contract.
 * @param options - The options for the contractURI function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { contractURI } from "TODO";
 * 
 * const result = await contractURI();
 * 
 * ```
 */
export async function contractURI(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xe8a3d485",
  [],
  [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "getActiveClaimConditionId" function.
 */
export type GetActiveClaimConditionIdParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
};

/**
 * Calls the "getActiveClaimConditionId" function on the contract.
 * @param options - The options for the getActiveClaimConditionId function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getActiveClaimConditionId } from "TODO";
 * 
 * const result = await getActiveClaimConditionId({
 *  tokenId: ...,
 * });
 * 
 * ```
 */
export async function getActiveClaimConditionId(
  options: BaseTransactionOptions<GetActiveClaimConditionIdParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x5ab063e8",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.tokenId]
  });
};




/**
 * Calls the "getBaseURICount" function on the contract.
 * @param options - The options for the getBaseURICount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getBaseURICount } from "TODO";
 * 
 * const result = await getBaseURICount();
 * 
 * ```
 */
export async function getBaseURICount(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x63b45e2d",
  [],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "getBatchIdAtIndex" function.
 */
export type GetBatchIdAtIndexParams = {
  index: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_index","type":"uint256"}>
};

/**
 * Calls the "getBatchIdAtIndex" function on the contract.
 * @param options - The options for the getBatchIdAtIndex function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getBatchIdAtIndex } from "TODO";
 * 
 * const result = await getBatchIdAtIndex({
 *  index: ...,
 * });
 * 
 * ```
 */
export async function getBatchIdAtIndex(
  options: BaseTransactionOptions<GetBatchIdAtIndexParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x2419f51b",
  [
    {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.index]
  });
};


/**
 * Represents the parameters for the "getClaimConditionById" function.
 */
export type GetClaimConditionByIdParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
conditionId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_conditionId","type":"uint256"}>
};

/**
 * Calls the "getClaimConditionById" function on the contract.
 * @param options - The options for the getClaimConditionById function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getClaimConditionById } from "TODO";
 * 
 * const result = await getClaimConditionById({
 *  tokenId: ...,
 *  conditionId: ...,
 * });
 * 
 * ```
 */
export async function getClaimConditionById(
  options: BaseTransactionOptions<GetClaimConditionByIdParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xd45b28d7",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_conditionId",
      "type": "uint256"
    }
  ],
  [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "startTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxClaimableSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "supplyClaimed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantityLimitPerWallet",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "merkleRoot",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "currency",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        }
      ],
      "internalType": "struct IClaimCondition.ClaimCondition",
      "name": "condition",
      "type": "tuple"
    }
  ]
],
    params: [options.tokenId, options.conditionId]
  });
};




/**
 * Calls the "getDefaultRoyaltyInfo" function on the contract.
 * @param options - The options for the getDefaultRoyaltyInfo function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getDefaultRoyaltyInfo } from "TODO";
 * 
 * const result = await getDefaultRoyaltyInfo();
 * 
 * ```
 */
export async function getDefaultRoyaltyInfo(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xb24f2d39",
  [],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint16",
      "name": "",
      "type": "uint16"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "getRoleAdmin" function.
 */
export type GetRoleAdminParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
};

/**
 * Calls the "getRoleAdmin" function on the contract.
 * @param options - The options for the getRoleAdmin function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRoleAdmin } from "TODO";
 * 
 * const result = await getRoleAdmin({
 *  role: ...,
 * });
 * 
 * ```
 */
export async function getRoleAdmin(
  options: BaseTransactionOptions<GetRoleAdminParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x248a9ca3",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    }
  ],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: [options.role]
  });
};


/**
 * Represents the parameters for the "getRoleMember" function.
 */
export type GetRoleMemberParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
index: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"index","type":"uint256"}>
};

/**
 * Calls the "getRoleMember" function on the contract.
 * @param options - The options for the getRoleMember function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRoleMember } from "TODO";
 * 
 * const result = await getRoleMember({
 *  role: ...,
 *  index: ...,
 * });
 * 
 * ```
 */
export async function getRoleMember(
  options: BaseTransactionOptions<GetRoleMemberParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x9010d07c",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "uint256",
      "name": "index",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "member",
      "type": "address"
    }
  ]
],
    params: [options.role, options.index]
  });
};


/**
 * Represents the parameters for the "getRoleMemberCount" function.
 */
export type GetRoleMemberCountParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
};

/**
 * Calls the "getRoleMemberCount" function on the contract.
 * @param options - The options for the getRoleMemberCount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRoleMemberCount } from "TODO";
 * 
 * const result = await getRoleMemberCount({
 *  role: ...,
 * });
 * 
 * ```
 */
export async function getRoleMemberCount(
  options: BaseTransactionOptions<GetRoleMemberCountParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xca15c873",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "count",
      "type": "uint256"
    }
  ]
],
    params: [options.role]
  });
};


/**
 * Represents the parameters for the "getRoyaltyInfoForToken" function.
 */
export type GetRoyaltyInfoForTokenParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
};

/**
 * Calls the "getRoyaltyInfoForToken" function on the contract.
 * @param options - The options for the getRoyaltyInfoForToken function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRoyaltyInfoForToken } from "TODO";
 * 
 * const result = await getRoyaltyInfoForToken({
 *  tokenId: ...,
 * });
 * 
 * ```
 */
export async function getRoyaltyInfoForToken(
  options: BaseTransactionOptions<GetRoyaltyInfoForTokenParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x4cc157df",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint16",
      "name": "",
      "type": "uint16"
    }
  ]
],
    params: [options.tokenId]
  });
};


/**
 * Represents the parameters for the "getSupplyClaimedByWallet" function.
 */
export type GetSupplyClaimedByWalletParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
conditionId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_conditionId","type":"uint256"}>
claimer: AbiParameterToPrimitiveType<{"internalType":"address","name":"_claimer","type":"address"}>
};

/**
 * Calls the "getSupplyClaimedByWallet" function on the contract.
 * @param options - The options for the getSupplyClaimedByWallet function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getSupplyClaimedByWallet } from "TODO";
 * 
 * const result = await getSupplyClaimedByWallet({
 *  tokenId: ...,
 *  conditionId: ...,
 *  claimer: ...,
 * });
 * 
 * ```
 */
export async function getSupplyClaimedByWallet(
  options: BaseTransactionOptions<GetSupplyClaimedByWalletParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x5811ddab",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_conditionId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_claimer",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "supplyClaimedByWallet",
      "type": "uint256"
    }
  ]
],
    params: [options.tokenId, options.conditionId, options.claimer]
  });
};


/**
 * Represents the parameters for the "hasRole" function.
 */
export type HasRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "hasRole" function on the contract.
 * @param options - The options for the hasRole function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { hasRole } from "TODO";
 * 
 * const result = await hasRole({
 *  role: ...,
 *  account: ...,
 * });
 * 
 * ```
 */
export async function hasRole(
  options: BaseTransactionOptions<HasRoleParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x91d14854",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "hasRoleWithSwitch" function.
 */
export type HasRoleWithSwitchParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "hasRoleWithSwitch" function on the contract.
 * @param options - The options for the hasRoleWithSwitch function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { hasRoleWithSwitch } from "TODO";
 * 
 * const result = await hasRoleWithSwitch({
 *  role: ...,
 *  account: ...,
 * });
 * 
 * ```
 */
export async function hasRoleWithSwitch(
  options: BaseTransactionOptions<HasRoleWithSwitchParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xa32fa5b3",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "isApprovedForAll" function.
 */
export type IsApprovedForAllParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
};

/**
 * Calls the "isApprovedForAll" function on the contract.
 * @param options - The options for the isApprovedForAll function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isApprovedForAll } from "TODO";
 * 
 * const result = await isApprovedForAll({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 * 
 * ```
 */
export async function isApprovedForAll(
  options: BaseTransactionOptions<IsApprovedForAllParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xe985e9c5",
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};




/**
 * Calls the "name" function on the contract.
 * @param options - The options for the name function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { name } from "TODO";
 * 
 * const result = await name();
 * 
 * ```
 */
export async function name(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x06fdde03",
  [],
  [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "nextTokenIdToMint" function on the contract.
 * @param options - The options for the nextTokenIdToMint function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { nextTokenIdToMint } from "TODO";
 * 
 * const result = await nextTokenIdToMint();
 * 
 * ```
 */
export async function nextTokenIdToMint(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x3b1475a7",
  [],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "primarySaleRecipient" function on the contract.
 * @param options - The options for the primarySaleRecipient function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { primarySaleRecipient } from "TODO";
 * 
 * const result = await primarySaleRecipient();
 * 
 * ```
 */
export async function primarySaleRecipient(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x079fe40e",
  [],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "royaltyInfo" function.
 */
export type RoyaltyInfoParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"tokenId","type":"uint256"}>
salePrice: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"salePrice","type":"uint256"}>
};

/**
 * Calls the "royaltyInfo" function on the contract.
 * @param options - The options for the royaltyInfo function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { royaltyInfo } from "TODO";
 * 
 * const result = await royaltyInfo({
 *  tokenId: ...,
 *  salePrice: ...,
 * });
 * 
 * ```
 */
export async function royaltyInfo(
  options: BaseTransactionOptions<RoyaltyInfoParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x2a55205a",
  [
    {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "salePrice",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "receiver",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "royaltyAmount",
      "type": "uint256"
    }
  ]
],
    params: [options.tokenId, options.salePrice]
  });
};


/**
 * Represents the parameters for the "saleRecipient" function.
 */
export type SaleRecipientParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "saleRecipient" function on the contract.
 * @param options - The options for the saleRecipient function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { saleRecipient } from "TODO";
 * 
 * const result = await saleRecipient({
 *  arg_0: ...,
 * });
 * 
 * ```
 */
export async function saleRecipient(
  options: BaseTransactionOptions<SaleRecipientParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xc7337d6b",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "supportsInterface" function.
 */
export type SupportsInterfaceParams = {
  interfaceId: AbiParameterToPrimitiveType<{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}>
};

/**
 * Calls the "supportsInterface" function on the contract.
 * @param options - The options for the supportsInterface function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { supportsInterface } from "TODO";
 * 
 * const result = await supportsInterface({
 *  interfaceId: ...,
 * });
 * 
 * ```
 */
export async function supportsInterface(
  options: BaseTransactionOptions<SupportsInterfaceParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x01ffc9a7",
  [
    {
      "internalType": "bytes4",
      "name": "interfaceId",
      "type": "bytes4"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.interfaceId]
  });
};




/**
 * Calls the "symbol" function on the contract.
 * @param options - The options for the symbol function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { symbol } from "TODO";
 * 
 * const result = await symbol();
 * 
 * ```
 */
export async function symbol(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x95d89b41",
  [],
  [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "totalSupply" function.
 */
export type TotalSupplyParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "totalSupply" function on the contract.
 * @param options - The options for the totalSupply function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { totalSupply } from "TODO";
 * 
 * const result = await totalSupply({
 *  arg_0: ...,
 * });
 * 
 * ```
 */
export async function totalSupply(
  options: BaseTransactionOptions<TotalSupplyParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xbd85b039",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "uri" function.
 */
export type UriParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
};

/**
 * Calls the "uri" function on the contract.
 * @param options - The options for the uri function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { uri } from "TODO";
 * 
 * const result = await uri({
 *  tokenId: ...,
 * });
 * 
 * ```
 */
export async function uri(
  options: BaseTransactionOptions<UriParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x0e89341c",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ]
],
    params: [options.tokenId]
  });
};


/**
 * Represents the parameters for the "verify" function.
 */
export type VerifyParams = {
  req: AbiParameterToPrimitiveType<{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"inTokenIds","type":"uint256[]"},{"internalType":"uint256","name":"outTokenId","type":"uint256"},{"internalType":"uint128","name":"validityStartTimestamp","type":"uint128"},{"internalType":"uint128","name":"validityEndTimestamp","type":"uint128"},{"internalType":"bytes32","name":"uid","type":"bytes32"}],"internalType":"struct ICitiesSignatureClaim.ClaimRequest","name":"_req","type":"tuple"}>
signature: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"_signature","type":"bytes"}>
};

/**
 * Calls the "verify" function on the contract.
 * @param options - The options for the verify function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { verify } from "TODO";
 * 
 * const result = await verify({
 *  req: ...,
 *  signature: ...,
 * });
 * 
 * ```
 */
export async function verify(
  options: BaseTransactionOptions<VerifyParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x77a792e8",
  [
    {
      "components": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "inTokenIds",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "outTokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint128",
          "name": "validityStartTimestamp",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "validityEndTimestamp",
          "type": "uint128"
        },
        {
          "internalType": "bytes32",
          "name": "uid",
          "type": "bytes32"
        }
      ],
      "internalType": "struct ICitiesSignatureClaim.ClaimRequest",
      "name": "_req",
      "type": "tuple"
    },
    {
      "internalType": "bytes",
      "name": "_signature",
      "type": "bytes"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "success",
      "type": "bool"
    },
    {
      "internalType": "address",
      "name": "signer",
      "type": "address"
    }
  ]
],
    params: [options.req, options.signature]
  });
};


/**
 * Represents the parameters for the "verifyClaim" function.
 */
export type VerifyClaimParams = {
  conditionId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_conditionId","type":"uint256"}>
claimer: AbiParameterToPrimitiveType<{"internalType":"address","name":"_claimer","type":"address"}>
tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
quantity: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_quantity","type":"uint256"}>
currency: AbiParameterToPrimitiveType<{"internalType":"address","name":"_currency","type":"address"}>
pricePerToken: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_pricePerToken","type":"uint256"}>
allowlistProof: AbiParameterToPrimitiveType<{"components":[{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},{"internalType":"uint256","name":"quantityLimitPerWallet","type":"uint256"},{"internalType":"uint256","name":"pricePerToken","type":"uint256"},{"internalType":"address","name":"currency","type":"address"}],"internalType":"struct IDrop1155.AllowlistProof","name":"_allowlistProof","type":"tuple"}>
};

/**
 * Calls the "verifyClaim" function on the contract.
 * @param options - The options for the verifyClaim function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { verifyClaim } from "TODO";
 * 
 * const result = await verifyClaim({
 *  conditionId: ...,
 *  claimer: ...,
 *  tokenId: ...,
 *  quantity: ...,
 *  currency: ...,
 *  pricePerToken: ...,
 *  allowlistProof: ...,
 * });
 * 
 * ```
 */
export async function verifyClaim(
  options: BaseTransactionOptions<VerifyClaimParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xea1def9c",
  [
    {
      "internalType": "uint256",
      "name": "_conditionId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_claimer",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_quantity",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_currency",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_pricePerToken",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint256",
          "name": "quantityLimitPerWallet",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "currency",
          "type": "address"
        }
      ],
      "internalType": "struct IDrop1155.AllowlistProof",
      "name": "_allowlistProof",
      "type": "tuple"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "isOverride",
      "type": "bool"
    }
  ]
],
    params: [options.conditionId, options.claimer, options.tokenId, options.quantity, options.currency, options.pricePerToken, options.allowlistProof]
  });
};


/**
* Contract write functions
*/

/**
 * Represents the parameters for the "burn" function.
 */
export type BurnParams = {
  owner: AbiParameterToPrimitiveType<{"internalType":"address","name":"_owner","type":"address"}>
tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
amount: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_amount","type":"uint256"}>
};

/**
 * Calls the "burn" function on the contract.
 * @param options - The options for the "burn" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { burn } from "TODO";
 * 
 * const transaction = burn({
 *  owner: ...,
 *  tokenId: ...,
 *  amount: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function burn(
  options: BaseTransactionOptions<BurnParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xf5298aca",
  [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.owner, options.tokenId, options.amount]
  });
};


/**
 * Represents the parameters for the "burnBatch" function.
 */
export type BurnBatchParams = {
  owner: AbiParameterToPrimitiveType<{"internalType":"address","name":"_owner","type":"address"}>
tokenIds: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}>
amounts: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"}>
};

/**
 * Calls the "burnBatch" function on the contract.
 * @param options - The options for the "burnBatch" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { burnBatch } from "TODO";
 * 
 * const transaction = burnBatch({
 *  owner: ...,
 *  tokenIds: ...,
 *  amounts: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function burnBatch(
  options: BaseTransactionOptions<BurnBatchParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x6b20c454",
  [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    },
    {
      "internalType": "uint256[]",
      "name": "_tokenIds",
      "type": "uint256[]"
    },
    {
      "internalType": "uint256[]",
      "name": "_amounts",
      "type": "uint256[]"
    }
  ],
  []
],
    params: [options.owner, options.tokenIds, options.amounts]
  });
};


/**
 * Represents the parameters for the "claim" function.
 */
export type ClaimParams = {
  receiver: AbiParameterToPrimitiveType<{"internalType":"address","name":"_receiver","type":"address"}>
tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
quantity: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_quantity","type":"uint256"}>
currency: AbiParameterToPrimitiveType<{"internalType":"address","name":"_currency","type":"address"}>
pricePerToken: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_pricePerToken","type":"uint256"}>
allowlistProof: AbiParameterToPrimitiveType<{"components":[{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},{"internalType":"uint256","name":"quantityLimitPerWallet","type":"uint256"},{"internalType":"uint256","name":"pricePerToken","type":"uint256"},{"internalType":"address","name":"currency","type":"address"}],"internalType":"struct IDrop1155.AllowlistProof","name":"_allowlistProof","type":"tuple"}>
data: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"_data","type":"bytes"}>
};

/**
 * Calls the "claim" function on the contract.
 * @param options - The options for the "claim" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claim } from "TODO";
 * 
 * const transaction = claim({
 *  receiver: ...,
 *  tokenId: ...,
 *  quantity: ...,
 *  currency: ...,
 *  pricePerToken: ...,
 *  allowlistProof: ...,
 *  data: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function claim(
  options: BaseTransactionOptions<ClaimParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x57bc3d78",
  [
    {
      "internalType": "address",
      "name": "_receiver",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_quantity",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_currency",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_pricePerToken",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint256",
          "name": "quantityLimitPerWallet",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "currency",
          "type": "address"
        }
      ],
      "internalType": "struct IDrop1155.AllowlistProof",
      "name": "_allowlistProof",
      "type": "tuple"
    },
    {
      "internalType": "bytes",
      "name": "_data",
      "type": "bytes"
    }
  ],
  []
],
    params: [options.receiver, options.tokenId, options.quantity, options.currency, options.pricePerToken, options.allowlistProof, options.data]
  });
};


/**
 * Represents the parameters for the "claimBatch" function.
 */
export type ClaimBatchParams = {
  receiver: AbiParameterToPrimitiveType<{"internalType":"address","name":"_receiver","type":"address"}>
tokenIds: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}>
quantities: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"_quantities","type":"uint256[]"}>
currency: AbiParameterToPrimitiveType<{"internalType":"address","name":"_currency","type":"address"}>
pricePerToken: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_pricePerToken","type":"uint256"}>
allowlistProof: AbiParameterToPrimitiveType<{"components":[{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},{"internalType":"uint256","name":"quantityLimitPerWallet","type":"uint256"},{"internalType":"uint256","name":"pricePerToken","type":"uint256"},{"internalType":"address","name":"currency","type":"address"}],"internalType":"struct IDrop1155.AllowlistProof","name":"_allowlistProof","type":"tuple"}>
data: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"_data","type":"bytes"}>
};

/**
 * Calls the "claimBatch" function on the contract.
 * @param options - The options for the "claimBatch" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimBatch } from "TODO";
 * 
 * const transaction = claimBatch({
 *  receiver: ...,
 *  tokenIds: ...,
 *  quantities: ...,
 *  currency: ...,
 *  pricePerToken: ...,
 *  allowlistProof: ...,
 *  data: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function claimBatch(
  options: BaseTransactionOptions<ClaimBatchParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x5435522a",
  [
    {
      "internalType": "address",
      "name": "_receiver",
      "type": "address"
    },
    {
      "internalType": "uint256[]",
      "name": "_tokenIds",
      "type": "uint256[]"
    },
    {
      "internalType": "uint256[]",
      "name": "_quantities",
      "type": "uint256[]"
    },
    {
      "internalType": "address",
      "name": "_currency",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_pricePerToken",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint256",
          "name": "quantityLimitPerWallet",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "currency",
          "type": "address"
        }
      ],
      "internalType": "struct IDrop1155.AllowlistProof",
      "name": "_allowlistProof",
      "type": "tuple"
    },
    {
      "internalType": "bytes",
      "name": "_data",
      "type": "bytes"
    }
  ],
  []
],
    params: [options.receiver, options.tokenIds, options.quantities, options.currency, options.pricePerToken, options.allowlistProof, options.data]
  });
};


/**
 * Represents the parameters for the "claimWithSignature" function.
 */
export type ClaimWithSignatureParams = {
  req: AbiParameterToPrimitiveType<{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"inTokenIds","type":"uint256[]"},{"internalType":"uint256","name":"outTokenId","type":"uint256"},{"internalType":"uint128","name":"validityStartTimestamp","type":"uint128"},{"internalType":"uint128","name":"validityEndTimestamp","type":"uint128"},{"internalType":"bytes32","name":"uid","type":"bytes32"}],"internalType":"struct ICitiesSignatureClaim.ClaimRequest","name":"_req","type":"tuple"}>
signature: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"_signature","type":"bytes"}>
};

/**
 * Calls the "claimWithSignature" function on the contract.
 * @param options - The options for the "claimWithSignature" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimWithSignature } from "TODO";
 * 
 * const transaction = claimWithSignature({
 *  req: ...,
 *  signature: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function claimWithSignature(
  options: BaseTransactionOptions<ClaimWithSignatureParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x298d65e1",
  [
    {
      "components": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "inTokenIds",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "outTokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint128",
          "name": "validityStartTimestamp",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "validityEndTimestamp",
          "type": "uint128"
        },
        {
          "internalType": "bytes32",
          "name": "uid",
          "type": "bytes32"
        }
      ],
      "internalType": "struct ICitiesSignatureClaim.ClaimRequest",
      "name": "_req",
      "type": "tuple"
    },
    {
      "internalType": "bytes",
      "name": "_signature",
      "type": "bytes"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "signer",
      "type": "address"
    }
  ]
],
    params: [options.req, options.signature]
  });
};


/**
 * Represents the parameters for the "freezeBatchBaseURI" function.
 */
export type FreezeBatchBaseURIParams = {
  index: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_index","type":"uint256"}>
};

/**
 * Calls the "freezeBatchBaseURI" function on the contract.
 * @param options - The options for the "freezeBatchBaseURI" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { freezeBatchBaseURI } from "TODO";
 * 
 * const transaction = freezeBatchBaseURI({
 *  index: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function freezeBatchBaseURI(
  options: BaseTransactionOptions<FreezeBatchBaseURIParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xa07ced9e",
  [
    {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.index]
  });
};


/**
 * Represents the parameters for the "grantRole" function.
 */
export type GrantRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "grantRole" function on the contract.
 * @param options - The options for the "grantRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { grantRole } from "TODO";
 * 
 * const transaction = grantRole({
 *  role: ...,
 *  account: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function grantRole(
  options: BaseTransactionOptions<GrantRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x2f2ff15d",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  []
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "lazyMint" function.
 */
export type LazyMintParams = {
  amount: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_amount","type":"uint256"}>
baseURIForTokens: AbiParameterToPrimitiveType<{"internalType":"string","name":"_baseURIForTokens","type":"string"}>
data: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"_data","type":"bytes"}>
};

/**
 * Calls the "lazyMint" function on the contract.
 * @param options - The options for the "lazyMint" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { lazyMint } from "TODO";
 * 
 * const transaction = lazyMint({
 *  amount: ...,
 *  baseURIForTokens: ...,
 *  data: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function lazyMint(
  options: BaseTransactionOptions<LazyMintParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xd37c353b",
  [
    {
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "_baseURIForTokens",
      "type": "string"
    },
    {
      "internalType": "bytes",
      "name": "_data",
      "type": "bytes"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "batchId",
      "type": "uint256"
    }
  ]
],
    params: [options.amount, options.baseURIForTokens, options.data]
  });
};


/**
 * Represents the parameters for the "multicall" function.
 */
export type MulticallParams = {
  data: AbiParameterToPrimitiveType<{"internalType":"bytes[]","name":"data","type":"bytes[]"}>
};

/**
 * Calls the "multicall" function on the contract.
 * @param options - The options for the "multicall" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { multicall } from "TODO";
 * 
 * const transaction = multicall({
 *  data: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function multicall(
  options: BaseTransactionOptions<MulticallParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xac9650d8",
  [
    {
      "internalType": "bytes[]",
      "name": "data",
      "type": "bytes[]"
    }
  ],
  [
    {
      "internalType": "bytes[]",
      "name": "results",
      "type": "bytes[]"
    }
  ]
],
    params: [options.data]
  });
};


/**
 * Represents the parameters for the "renounceRole" function.
 */
export type RenounceRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "renounceRole" function on the contract.
 * @param options - The options for the "renounceRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { renounceRole } from "TODO";
 * 
 * const transaction = renounceRole({
 *  role: ...,
 *  account: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function renounceRole(
  options: BaseTransactionOptions<RenounceRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x36568abe",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  []
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "revokeRole" function.
 */
export type RevokeRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "revokeRole" function on the contract.
 * @param options - The options for the "revokeRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { revokeRole } from "TODO";
 * 
 * const transaction = revokeRole({
 *  role: ...,
 *  account: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function revokeRole(
  options: BaseTransactionOptions<RevokeRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xd547741f",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  []
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "safeBatchTransferFrom" function.
 */
export type SafeBatchTransferFromParams = {
  from: AbiParameterToPrimitiveType<{"internalType":"address","name":"from","type":"address"}>
to: AbiParameterToPrimitiveType<{"internalType":"address","name":"to","type":"address"}>
ids: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"ids","type":"uint256[]"}>
amounts: AbiParameterToPrimitiveType<{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}>
data: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"data","type":"bytes"}>
};

/**
 * Calls the "safeBatchTransferFrom" function on the contract.
 * @param options - The options for the "safeBatchTransferFrom" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { safeBatchTransferFrom } from "TODO";
 * 
 * const transaction = safeBatchTransferFrom({
 *  from: ...,
 *  to: ...,
 *  ids: ...,
 *  amounts: ...,
 *  data: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function safeBatchTransferFrom(
  options: BaseTransactionOptions<SafeBatchTransferFromParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x2eb2c2d6",
  [
    {
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "internalType": "uint256[]",
      "name": "ids",
      "type": "uint256[]"
    },
    {
      "internalType": "uint256[]",
      "name": "amounts",
      "type": "uint256[]"
    },
    {
      "internalType": "bytes",
      "name": "data",
      "type": "bytes"
    }
  ],
  []
],
    params: [options.from, options.to, options.ids, options.amounts, options.data]
  });
};


/**
 * Represents the parameters for the "safeTransferFrom" function.
 */
export type SafeTransferFromParams = {
  from: AbiParameterToPrimitiveType<{"internalType":"address","name":"from","type":"address"}>
to: AbiParameterToPrimitiveType<{"internalType":"address","name":"to","type":"address"}>
id: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"id","type":"uint256"}>
amount: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"amount","type":"uint256"}>
data: AbiParameterToPrimitiveType<{"internalType":"bytes","name":"data","type":"bytes"}>
};

/**
 * Calls the "safeTransferFrom" function on the contract.
 * @param options - The options for the "safeTransferFrom" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { safeTransferFrom } from "TODO";
 * 
 * const transaction = safeTransferFrom({
 *  from: ...,
 *  to: ...,
 *  id: ...,
 *  amount: ...,
 *  data: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function safeTransferFrom(
  options: BaseTransactionOptions<SafeTransferFromParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xf242432a",
  [
    {
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "id",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "internalType": "bytes",
      "name": "data",
      "type": "bytes"
    }
  ],
  []
],
    params: [options.from, options.to, options.id, options.amount, options.data]
  });
};


/**
 * Represents the parameters for the "setApprovalForAll" function.
 */
export type SetApprovalForAllParams = {
  operator: AbiParameterToPrimitiveType<{"internalType":"address","name":"operator","type":"address"}>
approved: AbiParameterToPrimitiveType<{"internalType":"bool","name":"approved","type":"bool"}>
};

/**
 * Calls the "setApprovalForAll" function on the contract.
 * @param options - The options for the "setApprovalForAll" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setApprovalForAll } from "TODO";
 * 
 * const transaction = setApprovalForAll({
 *  operator: ...,
 *  approved: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setApprovalForAll(
  options: BaseTransactionOptions<SetApprovalForAllParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xa22cb465",
  [
    {
      "internalType": "address",
      "name": "operator",
      "type": "address"
    },
    {
      "internalType": "bool",
      "name": "approved",
      "type": "bool"
    }
  ],
  []
],
    params: [options.operator, options.approved]
  });
};


/**
 * Represents the parameters for the "setClaimConditions" function.
 */
export type SetClaimConditionsParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
conditions: AbiParameterToPrimitiveType<{"components":[{"internalType":"uint256","name":"startTimestamp","type":"uint256"},{"internalType":"uint256","name":"maxClaimableSupply","type":"uint256"},{"internalType":"uint256","name":"supplyClaimed","type":"uint256"},{"internalType":"uint256","name":"quantityLimitPerWallet","type":"uint256"},{"internalType":"bytes32","name":"merkleRoot","type":"bytes32"},{"internalType":"uint256","name":"pricePerToken","type":"uint256"},{"internalType":"address","name":"currency","type":"address"},{"internalType":"string","name":"metadata","type":"string"}],"internalType":"struct IClaimCondition.ClaimCondition[]","name":"_conditions","type":"tuple[]"}>
resetClaimEligibility: AbiParameterToPrimitiveType<{"internalType":"bool","name":"_resetClaimEligibility","type":"bool"}>
};

/**
 * Calls the "setClaimConditions" function on the contract.
 * @param options - The options for the "setClaimConditions" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setClaimConditions } from "TODO";
 * 
 * const transaction = setClaimConditions({
 *  tokenId: ...,
 *  conditions: ...,
 *  resetClaimEligibility: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setClaimConditions(
  options: BaseTransactionOptions<SetClaimConditionsParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x183718d1",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "startTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxClaimableSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "supplyClaimed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantityLimitPerWallet",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "merkleRoot",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "currency",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        }
      ],
      "internalType": "struct IClaimCondition.ClaimCondition[]",
      "name": "_conditions",
      "type": "tuple[]"
    },
    {
      "internalType": "bool",
      "name": "_resetClaimEligibility",
      "type": "bool"
    }
  ],
  []
],
    params: [options.tokenId, options.conditions, options.resetClaimEligibility]
  });
};


/**
 * Represents the parameters for the "setContractURI" function.
 */
export type SetContractURIParams = {
  uri: AbiParameterToPrimitiveType<{"internalType":"string","name":"_uri","type":"string"}>
};

/**
 * Calls the "setContractURI" function on the contract.
 * @param options - The options for the "setContractURI" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setContractURI } from "TODO";
 * 
 * const transaction = setContractURI({
 *  uri: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setContractURI(
  options: BaseTransactionOptions<SetContractURIParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x938e3d7b",
  [
    {
      "internalType": "string",
      "name": "_uri",
      "type": "string"
    }
  ],
  []
],
    params: [options.uri]
  });
};


/**
 * Represents the parameters for the "setDefaultRoyaltyInfo" function.
 */
export type SetDefaultRoyaltyInfoParams = {
  royaltyRecipient: AbiParameterToPrimitiveType<{"internalType":"address","name":"_royaltyRecipient","type":"address"}>
royaltyBps: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_royaltyBps","type":"uint256"}>
};

/**
 * Calls the "setDefaultRoyaltyInfo" function on the contract.
 * @param options - The options for the "setDefaultRoyaltyInfo" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setDefaultRoyaltyInfo } from "TODO";
 * 
 * const transaction = setDefaultRoyaltyInfo({
 *  royaltyRecipient: ...,
 *  royaltyBps: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setDefaultRoyaltyInfo(
  options: BaseTransactionOptions<SetDefaultRoyaltyInfoParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x600dd5ea",
  [
    {
      "internalType": "address",
      "name": "_royaltyRecipient",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_royaltyBps",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.royaltyRecipient, options.royaltyBps]
  });
};


/**
 * Represents the parameters for the "setPrimarySaleRecipient" function.
 */
export type SetPrimarySaleRecipientParams = {
  saleRecipient: AbiParameterToPrimitiveType<{"internalType":"address","name":"_saleRecipient","type":"address"}>
};

/**
 * Calls the "setPrimarySaleRecipient" function on the contract.
 * @param options - The options for the "setPrimarySaleRecipient" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setPrimarySaleRecipient } from "TODO";
 * 
 * const transaction = setPrimarySaleRecipient({
 *  saleRecipient: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setPrimarySaleRecipient(
  options: BaseTransactionOptions<SetPrimarySaleRecipientParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x6f4f2837",
  [
    {
      "internalType": "address",
      "name": "_saleRecipient",
      "type": "address"
    }
  ],
  []
],
    params: [options.saleRecipient]
  });
};


/**
 * Represents the parameters for the "setRoyaltyInfoForToken" function.
 */
export type SetRoyaltyInfoForTokenParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
recipient: AbiParameterToPrimitiveType<{"internalType":"address","name":"_recipient","type":"address"}>
bps: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_bps","type":"uint256"}>
};

/**
 * Calls the "setRoyaltyInfoForToken" function on the contract.
 * @param options - The options for the "setRoyaltyInfoForToken" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setRoyaltyInfoForToken } from "TODO";
 * 
 * const transaction = setRoyaltyInfoForToken({
 *  tokenId: ...,
 *  recipient: ...,
 *  bps: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setRoyaltyInfoForToken(
  options: BaseTransactionOptions<SetRoyaltyInfoForTokenParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x9bcf7a15",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_recipient",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_bps",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.tokenId, options.recipient, options.bps]
  });
};


/**
 * Represents the parameters for the "setSaleRecipientForToken" function.
 */
export type SetSaleRecipientForTokenParams = {
  tokenId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_tokenId","type":"uint256"}>
saleRecipient: AbiParameterToPrimitiveType<{"internalType":"address","name":"_saleRecipient","type":"address"}>
};

/**
 * Calls the "setSaleRecipientForToken" function on the contract.
 * @param options - The options for the "setSaleRecipientForToken" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setSaleRecipientForToken } from "TODO";
 * 
 * const transaction = setSaleRecipientForToken({
 *  tokenId: ...,
 *  saleRecipient: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function setSaleRecipientForToken(
  options: BaseTransactionOptions<SetSaleRecipientForTokenParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x29c49b9b",
  [
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_saleRecipient",
      "type": "address"
    }
  ],
  []
],
    params: [options.tokenId, options.saleRecipient]
  });
};


/**
 * Represents the parameters for the "updateBatchBaseURI" function.
 */
export type UpdateBatchBaseURIParams = {
  index: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_index","type":"uint256"}>
uri: AbiParameterToPrimitiveType<{"internalType":"string","name":"_uri","type":"string"}>
};

/**
 * Calls the "updateBatchBaseURI" function on the contract.
 * @param options - The options for the "updateBatchBaseURI" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { updateBatchBaseURI } from "TODO";
 * 
 * const transaction = updateBatchBaseURI({
 *  index: ...,
 *  uri: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function updateBatchBaseURI(
  options: BaseTransactionOptions<UpdateBatchBaseURIParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xde903ddd",
  [
    {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "_uri",
      "type": "string"
    }
  ],
  []
],
    params: [options.index, options.uri]
  });
};


