const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')

const uint8ArrayToHex = (
  value,
  opts = {}
) => {
  const hexes = /* @__PURE__ */ (() =>
  Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0")))()
  let string = ""
  for (let i = 0; i < value.length; i++) {
    // biome-ignore lint/style/noNonNullAssertion: we know this is defined
    string += hexes[value[i]]
  }
  const hex = `0x${string}`

  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size })
    return padHex(hex, { dir: "right", size: opts.size })
  }
  return hex
}

const randomBytes32 = async () => {
  return uint8ArrayToHex(
    globalThis.crypto.getRandomValues(new Uint8Array(32)),
  )
}

// Define the function to recover the signer's address
const recoverSignerAddress = (signature, typedData) => {
  // Recover the signer's address
  const signerAddress = ethers.verifyTypedData(
    typedData.domain,
    typedData.types,
    typedData.message,
    signature
  )

  return signerAddress;
}

const getCurrentBlockTime = async function () {
  const timestamp = await ethers.provider.getBlockNumber().then(blockNumber =>
        // getBlock returns a block object and it has a timestamp property.
        ethers.provider.getBlock(blockNumber).then(block => block.timestamp));
  return timestamp;
}

const getTypedData = async function (
  contractAddress,
  validityStartTimestamp,
  validityEndTimestamp,
  to,
  inTokenIds,
  outTokenId
) {

  const uuidBytes = await randomBytes32()

  return {
    types: {
      ClaimRequest: [
        { name: "to", type: "address" },
        { name: "inTokenIds", type: "uint256[]" },
        { name: "outTokenId", type: "uint256" },
        { name: "validityStartTimestamp", type: "uint128" },
        { name: "validityEndTimestamp", type: "uint128" },
        { name: "uid", type: "bytes32" }
      ],
    },
    domain: {
      name: 'CitiesSignatureClaim',
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: contractAddress,
    },
    primaryType: 'ClaimRequest',
    message: {
      to: to,
      inTokenIds: inTokenIds,
      outTokenId: outTokenId,
      validityStartTimestamp: validityStartTimestamp,
      validityEndTimestamp: validityEndTimestamp,
      uid: uuidBytes   
    },
  }
}

module.exports = {

  deployContract: async (admin, royaltyRecipient, royaltyBps, primarySaleRecipient) => {

    /* 
      address _defaultAdmin,
      string memory _name,
      string memory _symbol,
      address _royaltyRecipient,
      uint128 _royaltyBps,
      address _primarySaleRecipient
    */
    const Contract = await ethers.getContractFactory("Farconic")
    const contract = await Contract.deploy(admin.address, 'Farconic', 'CITIES', royaltyRecipient.address, royaltyBps, primarySaleRecipient.address)
    await contract.waitForDeployment()

  /*  console.log('factory address:', factory.target)
    console.log('vault address:', vaultImplementation.target)*/

    return contract
  },

  getMerkleProof: (allowlistedAddresses, addressToProve, limitPerWallet, price) => {
    const leaves = allowlistedAddresses.map(x => ethers.keccak256(x))
    const merkle = new MerkleTree(leaves, ethers.keccak256, { hashLeaves: true, sortPairs: true })
    const proof = merkle.getHexProof(ethers.keccak256(addressToProve.toString()))

    return {
      proof: proof,
      quantityLimitPerWallet: limitPerWallet,
      pricePerToken: price,
      currency: ethers.ZeroAddress
    }
  },

  getTypedData: getTypedData,

  getRevertReason: function (error) {
    const startIndex = error.message.indexOf("reverted with reason string '") + "reverted with reason string '".length;
    const endIndex = error.message.length - 1;
    let errorMessage = error.message.slice(startIndex, endIndex);
    errorMessage = errorMessage.slice(0, errorMessage.indexOf("'"));
    return errorMessage;
  },

  getCurrentBlockTime: getCurrentBlockTime,

  deployMockToken: async function (name, symbol) {
    const MockToken = await ethers.getContractFactory("MockToken");
    const token = await MockToken.deploy(name, symbol);
    await token.waitForDeployment();
    return token;
  },

  generateClaimRequest: async function (contractAddress, signer, to_address, inTokenIds, outTokenId, startTime, endTime) {
    // Generate a signature for the claim request

    /* 
    struct ClaimRequest {
      address to;
      uint256[] inTokenIds;
      uint256 outTokenId;
      uint128 validityStartTimestamp;
      uint128 validityEndTimestamp;
      bytes32 uid;
    }
   */
    const validStartTime = startTime || await getCurrentBlockTime()
    const validEndTime = endTime || Math.floor(validStartTime + 60 * 60 * 24)
    const typedData = await getTypedData(
      contractAddress,
      validStartTime,
      validEndTime,
      to_address,
      inTokenIds,
      outTokenId 
    )

    // Sign the typed data
    const signature = await signer.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    )

    //console.log('\tverified signer:', recoverSignerAddress(signature, typedData))
    //console.log(`\t${signer.address}`)

    return { signature, typedData }
  }
}