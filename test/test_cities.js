// We import Chai to use its asserting functions here.
const { expect, assert } = require("chai");
require("@nomicfoundation/hardhat-ethers");
const { time } = require("@nomicfoundation/hardhat-network-helpers")
const { deployCities, getMerkleProof, getRevertReason, getCurrentBlockTime, generateClaimRequest } = require("./test_helpers.js")
const metadata = require("./test_data/metadata.json")
const { ethers } = require("hardhat");

const ZERO_BYTES = ethers.zeroPadValue(ethers.toUtf8Bytes(''), 32)
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe(" -- Testing Cities -- ", function () {
  
  describe("Lazy Minting", function () {

    let cities
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      cities = await deployCities(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
    })

    it("should lazy mint a number of tokens", async function () {
      const tx = await cities.lazyMint(12, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, 'buildings_tier', ethers.toUtf8Bytes("Buildings"))
      expect(tx).to.emit(cities, 'TokensLazyMinted')
      const metadata = await cities.uri(0)
      //console.log(metadata)
      expect(await cities.uri(0)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/0`)
      expect(await cities.uri(11)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/11`)
      await expect(cities.uri(12)).to.be.revertedWithCustomError(cities,'BatchMintInvalidTokenId')
    })
  })

  describe("Setting Claim Conditions", function () {

    let cities
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      cities = await deployCities(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
      await cities.lazyMint(12, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, 'buildings_tier', ethers.toUtf8Bytes("Buildings"))
    })

    it("should set a claim condition for token 2", async function () {

      /* struct ClaimCondition {
        uint256 startTimestamp;
        uint256 maxClaimableSupply;
        uint256 supplyClaimed;
        uint256 quantityLimitPerWallet;
        bytes32 merkleRoot;
        uint256 pricePerToken;
        address currency;
        string metadata;
      } */

      const allowlistedAddresses = [
        user1.address,
        user2.address
      ]

      const encodedAddresses = new ethers.AbiCoder().encode(
        ['address[]'],
        [allowlistedAddresses]
      )

      const preSaleMerkel = ethers.keccak256(encodedAddresses);
      const publicSaleMerkel = ethers.zeroPadValue(ethers.toUtf8Bytes(''), 32)
      const presaleStartTime = await getCurrentBlockTime()
      const publicSaleStartTime = Math.floor(await getCurrentBlockTime() + 60 * 60 * 24 * 99)
      const claimConditions = [
        {
          startTimestamp: presaleStartTime, // start the presale now
          maxClaimableSupply: 1000, // limit how many mints for this presale
          pricePerToken: ethers.parseUnits("0.01", 18), // presale price
          supplyClaimed: 0, // how many have been claimed
          quantityLimitPerWallet: 5, // limit how many can be minted per wallet
          merkleRoot: preSaleMerkel, // the merkle root for the presale
          currency: ethers.ZeroAddress, // the currency for the presale,
          metadata: ''
        },
        {
          startTimestamp: publicSaleStartTime, // 24h after presale, start public sale
          maxClaimableSupply: 9000, // limit how many mints for this presale
          pricePerToken: ethers.parseUnits("0.08", 18), // public sale price
          supplyClaimed: 0, // how many have been claimed
          quantityLimitPerWallet: 10, // limit how many can be minted per wallet
          merkleRoot: publicSaleMerkel, // the merkle root for the presale
          currency: ethers.ZeroAddress, // the currency for the presale,
          metadata: ''
        }
      ]
      const tx1 = await cities.setClaimConditions(2, claimConditions, false)
      const retrievedClaimCondition1 = await cities.getClaimConditionById(2, 0);
      expect(retrievedClaimCondition1[1]).to.equal(1000)

      const tx2 = await cities.setClaimConditions(2, claimConditions, false)
      const retrievedClaimCondition2 = await cities.getClaimConditionById(2, 1);
      expect(retrievedClaimCondition2[1]).to.equal(9000)
    })

  })

  describe("Claiming", function () {

    let cities
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      cities = await deployCities(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
      //console.log('\tlazy minting 300 building tokens...')
      await cities.lazyMint(300, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, 'buildings_tier', ethers.toUtf8Bytes("Buildings"))
      //console.log('\tlazy minting 60 city tokens...')
      await cities.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, 'cities_tier', ethers.toUtf8Bytes("Cities"))
      //console.log('\tconfiguring claim conditions for building tokens...')

      const startTime = await getCurrentBlockTime()
      const claimCondition = [
        {
          startTimestamp: startTime, // start the presale now
          maxClaimableSupply: 5000, // limit how many mints for this presale
          pricePerToken: ethers.parseUnits("0", 18), // presale price
          supplyClaimed: 0, // how many have been claimed
          quantityLimitPerWallet: 50, // limit how many can be minted per wallet
          merkleRoot: ZERO_BYTES, // the merkle root for the presale
          currency: ethers.ZeroAddress, // the currency for the presale,
          metadata: ''
        }
      ]
      for (let i = 0; i < 300; i++) {
        const tx1 = await cities.setClaimConditions(i, claimCondition, false)
      }
      //console.log('\tclaim conditions for building tokens configured')
    })

    it("should allow a user to claim a building", async function () {

      /* function claim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data */

      // 1. mint 5 building tokens of same city
      const merkleProof = getMerkleProof([], user1.address, "50", '0')
      const tx1 = await cities.connect(user1).claim(user1.address, 0, 1, ethers.ZeroAddress, 0, merkleProof, ZERO_BYTES)
      const tx2 = await cities.connect(user1).claim(user1.address, 10, 1, ethers.ZeroAddress, 0, merkleProof, ZERO_BYTES)
      const tx3 = await cities.connect(user1).claim(user1.address, 100, 1, ethers.ZeroAddress, 0, merkleProof, ZERO_BYTES)
      const tx4 = await cities.connect(user1).claim(user1.address, 200, 1, ethers.ZeroAddress, 0, merkleProof, ZERO_BYTES)
      const tx5 = await cities.connect(user1).claim(user1.address, 299, 1, ethers.ZeroAddress, 0, merkleProof, ZERO_BYTES)
      expect(await cities.balanceOf(user1.address, 0)).to.equal(1)
      expect(await cities.balanceOf(user1.address, 10)).to.equal(1)
      expect(await cities.balanceOf(user1.address, 100)).to.equal(1)
      expect(await cities.balanceOf(user1.address, 200)).to.equal(1)
      expect(await cities.balanceOf(user1.address, 299)).to.equal(1)
      
      // 2. claim a city token via signature mint
      /**
        function mintWithSignature(
          MintRequest calldata _req,
          bytes calldata _signature
        ) 
     */

      // check that our admin has the MINTER_ROLE
      expect(await cities.hasRole(await cities.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)
      
      const inTokenIds = [0, 10, 100, 200, 299]
      const cr = await generateClaimRequest(cities.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, inTokenIds, 300)
      //console.log(cr)

      // check that the signature checks out by calling verify 
      const recovered = await cities.verify(cr.typedData.message, cr.signature)
      //console.log('\tcontract-signature-verified:', recovered)

      const tx = await cities.connect(user1).claimWithSignature(cr.typedData.message, cr.signature)

      // check that the token was issued to the correct address
      expect(await cities.balanceOf(user1.address, 300)).to.equal(1)

      // check that the input tokens are no longer owned by the user
      expect(await cities.balanceOf(user1.address, 0)).to.equal(0)
      expect(await cities.balanceOf(user1.address, 10)).to.equal(0)
      expect(await cities.balanceOf(user1.address, 100)).to.equal(0)
      expect(await cities.balanceOf(user1.address, 200)).to.equal(0)
      expect(await cities.balanceOf(user1.address, 299)).to.equal(0)

      // check that the tokens have been burned
      // emit TransferSingle(operator, from, address(0), id, amount);
      const burnEvents = await cities.queryFilter(cities.filters.TransferSingle(null, user1.address, ethers.ZeroAddress, null, null), tx.blockNumber)
      expect(burnEvents.length).to.equal(5)
      expect(burnEvents[0].args[3]).to.equal(0)
      expect(burnEvents[1].args[3]).to.equal(10)
      expect(burnEvents[2].args[3]).to.equal(100)
      expect(burnEvents[3].args[3]).to.equal(200)
      expect(burnEvents[4].args[3]).to.equal(299)
    })

    it("should not allow a user to claim a city", async function () {
      console.log('TO DO:')
    })

  })

  /* describe("Signature minting & burning", function () {

    let cities
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      const cities = await deployCities(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
      const tx = await cities.lazyMint(12, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, 'buildings_tier', ethers.toUtf8Bytes("Buildings"))
      expect(tx).to.emit(cities, 'TokensLazyMinted')
      const metadata = await cities.uri(0)
      //console.log(metadata)
      expect(await cities.uri(0)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/0`)
      expect(await cities.uri(11)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/11`)
      await expect(cities.uri(12)).to.be.revertedWithCustomError(cities,'BatchMintInvalidTokenId')
    })
  })

  describe("Transactions", function () {
    let owner, feeRecipient
    let cities, treasury

    before(async function () {
      [owner, feeRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      const deployedContracts = await deployCities(feeRecipient.address, 'SepoliaETH', 'https://zebra.xyz/')
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

    it("should lazy mint a number of tokens", async function () {
      const tx = await cities.lazyMint(12, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, 'buildings_tier', ethers.toUtf8Bytes("Buildings"))
      expect(tx).to.emit(cities, 'TokensLazyMinted')
      const metadata = await cities.uri(0)
      //console.log(metadata)
      expect(await cities.uri(0)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/0`)
      expect(await cities.uri(11)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/11`)
      await expect(cities.uri(12)).to.be.revertedWithCustomError(cities,'BatchMintInvalidTokenId')
    })

    it("should successfully mint new tokens and initalise vaults", async function () {
      const makeVaultFee = ethers.parseUnits("0.004", "ether")
      const mr = await generateMintRequest(cities.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER.address, user1.address)
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
  }) */

})