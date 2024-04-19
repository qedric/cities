// We import Chai to use its asserting functions here.
const { expect, assert } = require("chai");
const { ethers, upgrades, network } = require("hardhat");

const { time } = require("@nomicfoundation/hardhat-network-helpers")
const { deployCities, getTypedData, getRevertReason, getCurrentBlockTime, generateMintRequest } = require("./test_helpers");
const { lazyMintTokens } = require("../scripts/utils");
const metadata = require("./test_data/metadata.json");


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe(" -- Testing Cities -- ", function () {
  describe("Minting & Vault Creation", function () {

    let cities
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let feeRecipient, newFeeRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, feeRecipient, newFeeRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      const cities = await deployCities(admin, royaltyRecipient, royaltyBps, primarySaleRecipient)
      const tx = lazyMintTokens(cities, metadata)
      console.log(tx)
    })

    /*
      1. calls cities mintWithSignature()
      2. checks that user received the minted tokens
      3. checks that TokensMintedWithSignature' event was fired with correct args
      4. checks that VaultDeployed event was fired with correct args
    */
    it("should successfully mint new tokens and initalise vaults", async function () {
      const makeVaultFee = ethers.parseUnits("0.004", "ether")
      const mr = await generateMintRequest(cities.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address)
      const initialBalanceUser1 = await cities.balanceOf(user1.address, 0)

      const tx = await cities.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).mintWithSignature(mr.typedData.message, mr.signature, { value: makeVaultFee })

      // Verify that the token was minted and assigned to the correct recipient
      const finalBalanceUser1 = await cities.balanceOf(user1.address, 0)
      expect(finalBalanceUser1).to.equal(initialBalanceUser1+BigInt(4))

      // Verify events in the cities contract
      const tokensMintedEvent = await cities.queryFilter('TokensMintedWithSignature', -1)
      expect(tokensMintedEvent.length).to.equal(1)
      expect(tokensMintedEvent[0].args.signer).to.equal(INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)
      expect(tokensMintedEvent[0].args.mintedTo).to.equal(user1.address)
      expect(tokensMintedEvent[0].args.tokenIdMinted).to.equal(0)

      const vaultDeployedEvent = await cities.queryFilter('VaultDeployed', -1)
      expect(vaultDeployedEvent.length).to.equal(1)
      expect(vaultDeployedEvent[0].args.msgSender).to.equal(INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)

      // Retrieve the vault address from the VaultDeployed event
      const vaultAddress = vaultDeployedEvent[0].args.vault
    })

    it("should not allow a signature to be used before the start time", async function() {
      // Generate a signature for the mint request
      const timestamp = await ethers.provider.getBlockNumber().then(blockNumber =>
      // getBlock returns a block object and it has a timestamp property.
      ethers.provider.getBlock(blockNumber).then(block => block.timestamp))
      const startTime = Math.floor(timestamp + 60 * 60 * 24 * 2) // + 2 days - should FAIL
      const endTime = Math.floor(timestamp + 60 * 60 * 24 * 7) // + 7 days
      const unlockTime = Math.floor(timestamp + 60 * 60 * 24 * 99)
      const targetBalance = ethers.parseUnits("1", "ether").toString()

      const typedData = await getTypedData(
        cities.target,
        ZERO_ADDRESS,
        user1.address,
        startTime,
        endTime,
        4,
        unlockTime,
        targetBalance,
        'A test vault',
        'invalid start time'    
      )

      const mr = await generateMintRequest(
        cities.target,
        INITIAL_DEFAULT_ADMIN_AND_SIGNER,
        user1.address,
        typedData
      )

      const makeVaultFee = ethers.parseUnits("0.004", "ether")

      await expect(cities.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).mintWithSignature(
        mr.typedData.message,
        mr.signature,
        { value: makeVaultFee })
      ).to.be.revertedWith("Request expired")
    })

    it("should not allow a signature to be used after the expiry time", async function() {
      const timestamp = await ethers.provider.getBlockNumber().then(blockNumber =>
      // getBlock returns a block object and it has a timestamp property.
      ethers.provider.getBlock(blockNumber).then(block => block.timestamp))
      const startTime = Math.floor(timestamp - 60 * 60 * 24 * 7) // a week ago
      const endTime = Math.floor(timestamp - 60 * 60 * 24 * 3) // 3 days ago
      const unlockTime = Math.floor(timestamp + 60 * 60 * 24 * 99)
      const targetBalance = ethers.parseUnits("1", "ether").toString()

      const typedData = await getTypedData(
        cities.target,
        user1.address,
        ZERO_ADDRESS,
        startTime,
        endTime,
        4,
        unlockTime,
        targetBalance,
        'A test vault',
        'invalid end time'    
      )

      const mr = await generateMintRequest(
        cities.target,
        INITIAL_DEFAULT_ADMIN_AND_SIGNER,
        user1.address,
        typedData
      )

      const makeVaultFee = ethers.parseUnits("0.004", "ether")

      await expect(cities.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).mintWithSignature(
        mr.typedData.message,
        mr.signature,
        { value: makeVaultFee })
      ).to.be.revertedWith("Request expired")
    }) 

    it("should fail if a user sets unlock date in the past AND targetbalance <= 0", async function () {
      const timestamp = await ethers.provider.getBlockNumber().then(blockNumber =>
      // getBlock returns a block object and it has a timestamp property.
      ethers.provider.getBlock(blockNumber).then(block => block.timestamp))
      const startTime = Math.floor(timestamp - 60 * 60 * 24 * 7) // a week ago
      const endTime = Math.floor(timestamp + 60 * 60 * 24 * 3) // in 3 days

      const unlockTime = Math.floor(Date.now() / 1000) - 60 // 60 seconds in the past
      const targetBalance = 0

      const typedData = await getTypedData(
        cities.target,
        user1.address,
        ZERO_ADDRESS,
        startTime,
        endTime,
        4,
        unlockTime,
        targetBalance,
        'A test vault',
        'invalid unlock time with targetBalance zero'    
      )

      const mr = await generateMintRequest(
        cities.target,
        INITIAL_DEFAULT_ADMIN_AND_SIGNER,
        user1.address,
        typedData
      )

      const makeVaultFee = ethers.parseUnits("0.004", "ether")
      await expect(cities.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).mintWithSignature(
        mr.typedData.message,
        mr.signature,
        { value: makeVaultFee })
      ).to.be.revertedWith("Unlock time should be in the future, or target balance greater than 0")
    })

    it("should fail if a the quantity is <= 0", async function () {

       // Generate a signature for the mint request
      const timestamp = await ethers.provider.getBlockNumber().then(blockNumber =>
      // getBlock returns a block object and it has a timestamp property.
      ethers.provider.getBlock(blockNumber).then(block => block.timestamp))
      const startTime = Math.floor(timestamp - 60 * 60 * 24 * 7) // a week ago
      const endTime = Math.floor(timestamp + 60 * 60 * 24 * 7) // + 7 days
      const unlockTime = Math.floor(timestamp + 60 * 60 * 24 * 99)
      const targetBalance = ethers.parseUnits("1", "ether").toString()

      const typedData = await getTypedData(
        cities.target,
        user1.address,
        ZERO_ADDRESS,
        startTime,
        endTime,
        0,
        unlockTime,
        targetBalance,
        'A test vault',
        'invalid start time'    
      )

      const mr = await generateMintRequest(
        cities.target,
        INITIAL_DEFAULT_ADMIN_AND_SIGNER,
        user1.address,
        typedData
      )

      const makeVaultFee = ethers.parseUnits("0.004", "ether")
      await expect(cities.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).mintWithSignature(
        mr.typedData.message,
        mr.signature,
        { value: makeVaultFee })
      ).to.be.revertedWith("Minting zero tokens.")
    })
  })

  describe("Metadata", function () {

    let cities, vault
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER
    let user1, user2
    let feeRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1, user2, feeRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      const deployedContracts = await deploy(feeRecipient.address, 'SepoliaETH', 'https://zebra.xyz/')
      cities = deployedContracts.cities
      vault = await makeVault(cities, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1)
    })

    /*
      1. Call uri() with a valid tokenId
    */
    it("URI should not revert when called with valid tokenId", async function () {
      let metadata = await cities.uri(0)
      expect(metadata).to.exist
    })

    /*
      1. Call uri() with invalid tokenId
    */
    it("URI should revert when called with invalid tokenId", async function () {
      await expect(cities.uri(1)).to.be.revertedWith("Token not found")
    })

    /*
      1. Call uri() and verify that the percentage is 0
      2. Move blocktime to 33 days into 99 day unlocktime, ensure percentage still == 0
      3. send 0.2 ETH and ensure that percentage returned == 20
      4. send 0.2 ETH and ensure that percentage equals 33 (days)
      5. advance time another 33 days and ensure % == 40 (eth)
      4. send 0.6 ETH and ensure that percentage returned == 66 (days)
      5. advance time 44 days and ensure % == 100
    */
    it("URI should return metadata with correct percentage", async function () {

      async function getPercentage() {
        const metadata = await cities.uri(0)
        // Decode the base64 metadata
        //console.log(metadata)
        const decodedMetadata = JSON.parse(atob(metadata.split(',')[1]))
        return decodedMetadata.attributes.find(attr => attr.trait_type === "Percent Complete").value
      }

      // 1. Verify that the percentage is 0
      expect(await getPercentage()).to.equal(0, "Initial percentage should be 0")

      // 2. Move block time fwd 33 days; percent shoul still be 0 because it's the lowest progress
      await time.increase(60 * 60 * 24 * 33) // 33 days
      expect(await getPercentage()).to.equal(0, "Percentage should still be 0")

      // 3. Send 0.2 ETH and ensure that the percentage returned is 20
      await user1.sendTransaction({ to: vault.target, value: ethers.parseEther("0.2") })
      expect(await getPercentage()).to.equal(20, "Percentage should be 20 after sending 0.2 ETH")

      // 4. Send 0.2 ETH and ensure that the percentage returned is 33 (days is now lowest progress)
      await user1.sendTransaction({ to: vault.target, value: ethers.parseEther("0.2") })
      expect(await getPercentage()).to.equal(33, "Percentage should be 33 based on time to unlock")

      // 5. Move block time fwd another 33 days; percent should be 40 because ETH progress is lowest
      await time.increase(60 * 60 * 24 * 33) // 33 days
      expect(await getPercentage()).to.equal(40, "Percentage should be 40 based on ETH balance/target")

      // 6. Send 0.6 ETH and ensure that the percentage returned is 66 (days is now lowest progress)
      await user1.sendTransaction({ to: vault.target, value: ethers.parseEther("0.6") })
      expect(await getPercentage()).to.equal(66, "Percentage should be 66 based on time to unlock")

      // 5. Move block time fwd another 44 days; percent should now be 100 because ETH and time == 100
      await time.increase(60 * 60 * 24 * 44) // 33 days
      expect(await getPercentage()).to.equal(100, "Percentage should be 100")
    }) 
  })

  describe("Transactions", function () {
    let owner, feeRecipient
    let cities, treasury

    before(async function () {
      [owner, feeRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      const deployedContracts = await deploy(feeRecipient.address, 'SepoliaETH', 'https://zebra.xyz/')
      cities = deployedContracts.cities
      treasury = deployedContracts.treasury
    })

    it("should fail when sending native tokens to the cities", async function () {
      // Define the amount of ETH you want to send (in wei)
      const amountToSend = ethers.parseEther("1.2345")

      await expect(owner.sendTransaction({
        to: cities,
        value: amountToSend,
      })).to.be.reverted
    })

    it("should fail when sending non-native tokens to the cities contract", async function () {
      const vaultAddress = await makeVault(cities, owner, owner)
      await expect(cities.connect(owner).safeTransferFrom(owner.address, vaultAddress, 0, 2, "0x")).to.be.reverted
    })

    it("should transfer a quantity of NTFs from one holder to another", async function () {
      const vaultAddress = await makeVault(cities, owner, owner)
      await cities.connect(owner).safeTransferFrom(owner.address, feeRecipient.address, 0, 2, "0x")
      expect(await cities.balanceOf(feeRecipient.address, 0)).to.equal(2)
    })
  })

})