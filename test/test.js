// We import Chai to use its asserting functions here.
const { expect, assert } = require("chai")
require("@nomicfoundation/hardhat-ethers")
//const { time } = require("@nomicfoundation/hardhat-network-helpers")
const { deployContract: deployContract, getMerkleProof, getCurrentBlockTime, generateClaimRequest } = require("./test_helpers.js")
const { ethers } = require("hardhat")

const ZERO_BYTES = ethers.zeroPadValue(ethers.toUtf8Bytes(''), 32)
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe(" -- Testing Farconic -- ", function () {

  describe("Configuration", function () {

    // write tests to set the following state variables:
    /* 
      uint16 public freeClaimThreshold = 10
      uint16 public allowListedClaimThreshold = 100
      uint256 public price = 0 ether
      uint256 public allowListPrice = 0 ether
      address public currency = CurrencyTransferLib.NATIVE_TOKEN
      uint256 public maxBatchClaimSize = 10;
    */

    let contract
    let DEFAULT_ADMIN
    let user

    before(async function () {
      [DEFAULT_ADMIN, user] = await ethers.getSigners()
    })

    beforeEach(async function () {
      contract = await deployContract(DEFAULT_ADMIN, DEFAULT_ADMIN, 10_000, DEFAULT_ADMIN)
    })

    it("should allow only admin user to set the freeClaimThreshold state variable", async function () {
      // set the freeClaimThreshold to the current one plus 1:
      const currentThreshold = await contract.freeClaimThreshold()
      const newThreshold = currentThreshold + BigInt(1)
      await expect(contract.connect(user).setFreeClaimThreshold(newThreshold)).to.be.revertedWithCustomError(
        contract, "PermissionsUnauthorizedAccount").withArgs(
          user.address, DEFAULT_ADMIN_ROLE)
      await contract.connect(DEFAULT_ADMIN).setFreeClaimThreshold(newThreshold)
      expect(await contract.freeClaimThreshold()).to.equal(newThreshold)
    })

    it("should allow only admin user to set the allowListedClaimThreshold state variable", async function () {
      // set the freeClaimThreshold to the current one plus 1:
      const currentAllowListedThreshold = await contract.allowListedClaimThreshold()
      const newAllowListedhreshold = currentAllowListedThreshold + BigInt(1)
      await expect(contract.connect(user).setAllowListedClaimThreshold(newAllowListedhreshold)).to.be.revertedWithCustomError(
        contract, "PermissionsUnauthorizedAccount").withArgs(
          user.address, DEFAULT_ADMIN_ROLE)
      await contract.connect(DEFAULT_ADMIN).setAllowListedClaimThreshold(newAllowListedhreshold)
      expect(await contract.allowListedClaimThreshold()).to.equal(newAllowListedhreshold)
    })

    it("should allow only admin user to set the price state variable", async function () {
      const currentPrice = await contract.price()
      console.log('currentPrice:', currentPrice)
      const newPrice = currentPrice + ethers.parseEther("0.01")
      console.log(newPrice)
      await expect(contract.connect(user).setPrice(newPrice)).to.be.revertedWithCustomError(
        contract, "PermissionsUnauthorizedAccount").withArgs(
          user.address, DEFAULT_ADMIN_ROLE)
      await contract.connect(DEFAULT_ADMIN).setPrice(newPrice)
      expect(await contract.price()).to.equal(newPrice)
    })

    it("should allow only admin user to set the allowListPrice state variable", async function () {
      const currentAllowListPrice = await contract.allowListPrice()
      console.log('currentPrice:', currentAllowListPrice)
      const newAllowListPrice = currentAllowListPrice + ethers.parseEther("0.01")
      console.log(newAllowListPrice)
      await expect(contract.connect(user).setAllowListPrice(newAllowListPrice)).to.be.revertedWithCustomError(
        contract, "PermissionsUnauthorizedAccount").withArgs(
          user.address, DEFAULT_ADMIN_ROLE)
      await contract.connect(DEFAULT_ADMIN).setAllowListPrice(newAllowListPrice)
      expect(await contract.allowListPrice()).to.equal(newAllowListPrice)
    })

    it("should allow only admin user to set the currency state variable", async function () {
      const currency = await contract.currency()
      const newCurrency = user.address
      await expect(contract.connect(user).setCurrency(newCurrency)).to.be.revertedWithCustomError(
        contract, "PermissionsUnauthorizedAccount").withArgs(
          user.address, DEFAULT_ADMIN_ROLE)
      await contract.connect(DEFAULT_ADMIN).setCurrency(newCurrency)
      expect(await contract.currency()).to.equal(newCurrency)
    })

    it("should allow only admin user to set the maxBatchClaimSize state variable", async function () {
      // set the maxBatchClaimSize to the current one plus 1:
      const currentMaxBatchClaimSize = await contract.maxBatchClaimSize()
      const newMaxBatchClaimSize = currentMaxBatchClaimSize + BigInt(1)
      await expect(contract.connect(user).setMaxClaimBatchSize(newMaxBatchClaimSize)).to.be.revertedWithCustomError(
        contract, "PermissionsUnauthorizedAccount").withArgs(
          user.address, DEFAULT_ADMIN_ROLE)
      await contract.connect(DEFAULT_ADMIN).setMaxClaimBatchSize(newMaxBatchClaimSize)
      expect(await contract.maxBatchClaimSize()).to.equal(newMaxBatchClaimSize)
    })
  })
  
  describe("Lazy Minting", function () {

    let contract
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
    })

    it("should lazy mint a number of tokens", async function () {
      const tx = await contract.lazyMint(12, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Buildings"))
      expect(tx).to.emit(contract, 'TokensLazyMinted')
      const metadata = await contract.uri(0)
      //console.log(metadata)
      expect(await contract.uri(0)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/0`)
      expect(await contract.uri(11)).to.equal(`ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/11`)
      await expect(contract.uri(12)).to.be.revertedWithCustomError(contract,'BatchMintInvalidTokenId')
    })
  })

  /*
  describe("Setting Claim Conditions", function () {

    let contract
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
      await contract.lazyMint(12, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Buildings"))
    })

    it("should set a claim condition for token 2", async function () {

      /* struct ClaimCondition {
        uint256 startTimestamp
        uint256 maxClaimableSupply
        uint256 supplyClaimed
        uint256 quantityLimitPerWallet
        bytes32 merkleRoot
        uint256 pricePerToken
        address currency
        string metadata
      } 

      const allowlistedAddresses = [
        user1.address,
        user2.address
      ]

      const encodedAddresses = new ethers.AbiCoder().encode(
        ['address[]'],
        [allowlistedAddresses]
      )

      const preSaleMerkel = ethers.keccak256(encodedAddresses)
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
      const tx = await contract.setClaimConditions(2, claimConditions, false)
      const retrievedClaimCondition1 = await contract.getClaimConditionById(2, 0)
      expect(retrievedClaimCondition1[1]).to.equal(1000)

      const retrievedClaimCondition2 = await contract.getClaimConditionById(2, 1)
      expect(retrievedClaimCondition2[1]).to.equal(9000)
    })
  })
  */

  describe("Claiming", function () {

    let contract
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
      //console.log('\tlazy minting 300 building tokens...')
      await contract.lazyMint(300, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Buildings"))
      //console.log('\tlazy minting 60 city tokens...')
      await contract.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Cities"))
      //console.log('\tconfiguring claim conditions for building tokens...')

      /* const startTime = await getCurrentBlockTime()
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
      for (let i = 0 i < 300 i++) {
        const tx1 = await contract.setClaimConditions(i, claimCondition, false)
      } */
      //console.log('\tclaim conditions for building tokens configured')
    })

    it("should allow an admin user to claim a specific token", async function() {
      const merkleProof = getMerkleProof([], user1.address, "50", '0')

      await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(
        user1.address,        // address _receiver,
        5,                    // uint8 _tokenId
        12                    // uint8 _quantity
      )

      expect(await contract.balanceOf(user1.address, 5)).to.equal(12)
    })

    /* it("should fail if a non-admin user tries to claim a specific token", async function() {
      //const merkleProof = getMerkleProof([], user1.address, "50", '0')
      await expect(claimTx = contract.connect(user2).claim(
        user1.address,        // address _receiver,
        5,                    // uint8 _tokenId
        12,                   // uint8 _quantity
        ethers.ZeroAddress,   // address _currency,
        0,                    // uint256 _pricePerToken,
        //merkleProof,          // AllowlistProof calldata _allowlistProof,
        ZERO_BYTES            // bytes memory _data
      )).to.be.revertedWithCustomError(contract, "PermissionsUnauthorizedAccount").withArgs(
        user2.address, DEFAULT_ADMIN_ROLE)

      expect(await contract.balanceOf(user2.address, 5)).to.equal(0)
    }) */

    it("should allow a user to claim a batch of random tokens", async function() {
      //const merkleProof = getMerkleProof([], user1.address, "50", '0')
      const claimTx = await contract.connect(user1).claimRandomBatch(
        5,                    // uint8 _batchSize
        0,                    // uint8 _min
        299,                  // uint8 _max
        user1.address         // address _receiver
      )
    
      // get the TokensClaimed events for the claimTx
      const events = await contract.queryFilter(contract.filters.TokensClaimed(null, null, null, null), claimTx.blockNumber)
      for (const event of events) {
        console.log('claimed token:', event.args[2])
        expect(await contract.balanceOf(user1.address, event.args[2])).to.equal(1)
      }

    })

    it("should fail if a user tries to claim too many tokens", async function() {
      //const merkleProof = getMerkleProof([], user1.address, "50", '0')
      let tx = null
      await expect(tx = contract.connect(user1).claimRandomBatch(
        15,                    // uint8 _batchSize
        0,                    // uint8 _min
        299,                  // uint8 _max
        user1.address         // address _receiver
      )).to.be.revertedWithCustomError(contract, "MaxExceeded")
    })
  })

  describe("Signature Claiming", function () {

    let contract
    let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
    let user1, user2
    let royaltyRecipient, primarySaleRecipient

    before(async function () {
      [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
    })

    beforeEach(async function () {
      contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
      //console.log('\tlazy minting 300 building tokens...')
      await contract.lazyMint(300, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Buildings"))
      //console.log('\tlazy minting 60 city tokens...')
      await contract.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Cities"))
      //console.log('\tconfiguring claim conditions for building tokens...')

      /* const startTime = await getCurrentBlockTime()
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
      for (let i = 0 i < 300 i++) {
        const tx1 = await contract.setClaimConditions(i, claimCondition, false)
      } */
      //console.log('\tclaim conditions for building tokens configured')
    })

    it("should allow a user to claim and burn tokens with signature", async function () {

      /* function claim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data */

      // 1. mint 5 building tokens of same city
      //const merkleProof = getMerkleProof([], user1.address, "50", '0')
      const tx1 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 0, 1)
      const tx2 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 10, 1)
      const tx3 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 100, 1)
      const tx4 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 200, 1)
      const tx5 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 299, 1)
      expect(await contract.balanceOf(user1.address, 0)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 10)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 100)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 200)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 299)).to.equal(1)
      
      // 2. claim a city token via signature mint

      // check that our admin has the MINTER_ROLE
      expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)
      
      const inTokenIds = [0, 10, 100, 200, 299]
      const cr = await generateClaimRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, inTokenIds, 300)
      //console.log(cr)

      // check that the signature checks out by calling verify 
      const recovered = await contract.verify(cr.typedData.message, cr.signature)
      //console.log('\tcontract-signature-verified:', recovered)

      const tx = await contract.connect(user1).claimWithSignature(cr.typedData.message, cr.signature)

      // check that the token was issued to the correct address
      expect(await contract.balanceOf(user1.address, 300)).to.equal(1)

      // check that the input tokens are no longer owned by the user
      expect(await contract.balanceOf(user1.address, 0)).to.equal(0)
      expect(await contract.balanceOf(user1.address, 10)).to.equal(0)
      expect(await contract.balanceOf(user1.address, 100)).to.equal(0)
      expect(await contract.balanceOf(user1.address, 200)).to.equal(0)
      expect(await contract.balanceOf(user1.address, 299)).to.equal(0)

      // check that the tokens have been burned
      // emit TransferSingle(operator, from, address(0), id, amount)
      const burnEvents = await contract.queryFilter(contract.filters.TransferSingle(null, user1.address, ethers.ZeroAddress, null, null), tx.blockNumber)
      expect(burnEvents.length).to.equal(5)
      expect(burnEvents[0].args[3]).to.equal(0)
      expect(burnEvents[1].args[3]).to.equal(10)
      expect(burnEvents[2].args[3]).to.equal(100)
      expect(burnEvents[3].args[3]).to.equal(200)
      expect(burnEvents[4].args[3]).to.equal(299)
    })    

    it("should not allow a user without the MINTER_ROLE to sign a claim request", async function () {
      // 1. mint 5 tokens
      const merkleProof = getMerkleProof([], user1.address, "50", '0')
      const tx1 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 0, 1)
      const tx2 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 10, 1)
      const tx3 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 100, 1)
      const tx4 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 200, 1)
      const tx5 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 299, 1)
      expect(await contract.balanceOf(user1.address, 0)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 10)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 100)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 200)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 299)).to.equal(1)
      
      // 2. try to claim a city token via signature mint with unapproved signer

      // check that our admin doesn NOT have the MINTER_ROLE
      expect(await contract.hasRole(await contract.MINTER_ROLE(), user2.address)).to.equal(false)
      
      const inTokenIds = [0, 10, 100, 200, 299]

      // generate claim request with unauthorised signer
      const cr = await generateClaimRequest(contract.target, user2, user1.address, inTokenIds, 300)
      //console.log(cr)

      // check that the signature fails verify 
      const recovered = await contract.verify(cr.typedData.message, cr.signature) 
      expect(recovered[0]).to.equal(false)
      //console.log('\tcontract-signature-verified:', recovered)

      await expect(contract.connect(user1).claimWithSignature(
        cr.typedData.message, cr.signature)).to.be.revertedWith('Invalid request') 
    })

    it("should not allow a signature to be used before the start time", async function() {
      // 1. mint 5 building tokens of same city
      const merkleProof = getMerkleProof([], user1.address, "50", '0')
      const tx1 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 0, 1)
      const tx2 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 10, 1)
      const tx3 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 100, 1)
      const tx4 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 200, 1)
      const tx5 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 299, 1)
      expect(await contract.balanceOf(user1.address, 0)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 10)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 100)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 200)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 299)).to.equal(1)
      
      // 2. claim a city token via signature mint

      // check that our admin has the MINTER_ROLE
      expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)
      
      const inTokenIds = [0, 10, 100, 200, 299]

      // set a start time 12 hours from now
      const inValidStartTime = Math.floor((await getCurrentBlockTime()) + 60 * 60 * 12)

      const cr = await generateClaimRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, inTokenIds, 300, inValidStartTime)
      //console.log(cr)

      await expect(contract.connect(user1).claimWithSignature(
        cr.typedData.message, cr.signature)).to.be.revertedWith('Request expired') 
    })

    it("should not allow a signature to be used after the expiry time", async function() {
      // 1. mint 5 building tokens of same city
      const merkleProof = getMerkleProof([], user1.address, "50", '0')
      const tx1 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 0, 1)
      const tx2 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 10, 1)
      const tx3 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 100, 1)
      const tx4 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 200, 1)
      const tx5 = await contract.connect(INITIAL_DEFAULT_ADMIN_AND_SIGNER).claim(user1.address, 299, 1)
      expect(await contract.balanceOf(user1.address, 0)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 10)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 100)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 200)).to.equal(1)
      expect(await contract.balanceOf(user1.address, 299)).to.equal(1)
      
      // 2. claim a city token via signature mint

      // check that our admin has the MINTER_ROLE
      expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)
      
      const inTokenIds = [0, 10, 100, 200, 299]

      // set an end time 12 hours before now
      const validSartTime = Math.floor((await getCurrentBlockTime()) - 60 * 60 * 24)
      const inValidEndTime = Math.floor((await getCurrentBlockTime()) - 60 * 60 * 12)

      const cr = await generateClaimRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, inTokenIds, 300, validSartTime, inValidEndTime)
      //console.log(cr)

      await expect(contract.connect(user1).claimWithSignature(
        cr.typedData.message, cr.signature)).to.be.revertedWith('Request expired')
    }) 
  })
})