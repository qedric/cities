
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

module.exports = {

  deployCities: async (admin, royaltyRecipient, royaltyBps, primarySaleRecipient) => {

    /* 
      address _defaultAdmin,
      string memory _name,
      string memory _symbol,
      address _royaltyRecipient,
      uint128 _royaltyBps,
      address _primarySaleRecipient
    */

    const Cities = await ethers.getContractFactory("Cities")
    const cities = await Cities.deploy(admin.address, 'Cities', 'CT', royaltyRecipient.address, royaltyBps, primarySaleRecipient.address)
    await cities.waitForDeployment()

  /*  console.log('factory address:', factory.target)
    console.log('vault address:', vaultImplementation.target)*/

    return cities
  },

  getTypedData: async function (
    factory_address,
    to,
    baseToken,
    validityStartTimestamp,
    validityEndTimestamp,
    quantity,
    unlockTime,
    targetBalance,
    name,
    description
  ) {
    return {
      types: {
        MintRequest: [
          { name: "to", type: "address" },
          { name: "baseToken", type: "address" },
          { name: "validityStartTimestamp", type: "uint128" },
          { name: "validityEndTimestamp", type: "uint128" },
          { name: "quantity", type: "uint256" },
          { name: "unlockTime", type: "uint256" },
          { name: "targetBalance", type: "uint256" },
          { name: "name", type: "string" },
          { name: "description", type: "string" }
        ],
      },
      domain: {
        name: 'SignatureMintERC1155',
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: factory_address,
      },
      primaryType: 'MintRequest',
      message: {
        to: to,
        baseToken: baseToken,
        validityStartTimestamp: validityStartTimestamp,
        validityEndTimestamp: validityEndTimestamp,
        quantity: quantity,
        unlockTime: unlockTime,
        targetBalance: targetBalance,
        name: name,
        description: description      
      },
    };
  },

  getRevertReason: function (error) {
    const startIndex = error.message.indexOf("reverted with reason string '") + "reverted with reason string '".length;
    const endIndex = error.message.length - 1;
    let errorMessage = error.message.slice(startIndex, endIndex);
    errorMessage = errorMessage.slice(0, errorMessage.indexOf("'"));
    return errorMessage;
  },

  getCurrentBlockTime: async function () {
    const timestamp = await ethers.provider.getBlockNumber().then(blockNumber =>
          // getBlock returns a block object and it has a timestamp property.
          ethers.provider.getBlock(blockNumber).then(block => block.timestamp));
    return timestamp;
  },

  deployMockToken: async function (name, symbol) {
    const MockToken = await ethers.getContractFactory("MockToken");
    const token = await MockToken.deploy(name, symbol);
    await token.waitForDeployment();
    return token;
  },

  generateMintRequest: async function (factory_address, signer, to_address, typedData) {
    // Generate a signature for the mint request
    const timestamp = await getCurrentBlockTime()

    const endTime = Math.floor(timestamp + 60 * 60 * 24)
    const unlockTime = Math.floor(timestamp + 60 * 60 * 24 * 99)
    const targetBalance = ethers.parseUnits("1", "ether").toString()

    if (!typedData) {
      typedData = await getTypedData(
        factory_address,
        to_address,
        ZERO_ADDRESS,
        timestamp,
        endTime,
        4,
        unlockTime,
        targetBalance,
        'A test vault',
        'description'    
      )
    }

    // Sign the typed data
    const signature = await signer.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    )

    return { signature, typedData }
  }
}