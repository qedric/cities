const { expect } = require("chai");
const { ethers } = require("hardhat")

const { deployContract, getCurrentBlockTime, generateRequest } = require("./test_helpers.js")

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe(" -- Testing Farconic CITIES -- ", function () {

    describe("Configuration & Permissions", function () {

        // write tests for the following:
        /* 
          mapping(uint256 => uint256) public totalSupply;
          _canSetRoyaltyInfo()
          _canSetContractURI()
          _canLazyMint()
          _canSignRequest(address _signer)
        */
    })

    describe("Signature Minting", function () {

        let contract
        let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
        let user1, user2
        let royaltyRecipient

        before(async function () {
            [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, user1, user2, royaltyRecipient] = await ethers.getSigners()
        })

        beforeEach(async function () {
            contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000)
            //console.log('\tlazy minting 60 city tokens...')
            await contract.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Cities"))
        })

        it("should allow a user to mint tokens with signature", async function () {

            /*
                struct Request {
                    address targetAddress;
                    uint256 tokenId;
                    uint256 qty;
                    uint128 validityStartTimestamp;
                    uint128 validityEndTimestamp;
                    bytes32 uid;
                } 
            */

            // -- Mint a city token via signature mint --

            // check that our admin has the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)

            const cr = await generateRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, 0, 300)
            //console.log(cr)

            // check that the signature checks out by calling verify 
            const recovered = await contract.verify(cr.typedData.message, cr.signature)
            console.log('\tcontract-signature-verified:', recovered)
            expect(recovered[0]).to.equal(true)

            const tx = await contract.connect(user1).mintWithSignature(cr.typedData.message, cr.signature)

            // check that the token was issued to the correct address
            expect(await contract.balanceOf(user1.address, 0)).to.equal(300)
        })

        it("should not allow a user without the MINTER_ROLE to sign a request", async function () {

            // Try to claim a city token via signature mint with unapproved signer

            // check that our admin doesn NOT have the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), user2.address)).to.equal(false)

            // generate claim request with unauthorised signer
            const cr = await generateRequest(contract.target, user2, user1.address, 0, 300)
            //console.log(cr)

            // check that the signature fails verify 
            const recovered = await contract.verify(cr.typedData.message, cr.signature)
            expect(recovered[0]).to.equal(false)
            //console.log('\tcontract-signature-verified:', recovered)

            await expect(contract.connect(user1).mintWithSignature(
                cr.typedData.message, cr.signature)).to.be.revertedWith('Invalid request')
        })

        it("should not allow a signature to be used before the start time", async function () {


            // Mint a city token via signature mint

            // check that our admin has the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)

            // set a start time 12 hours from now
            const inValidStartTime = Math.floor((await getCurrentBlockTime()) + 60 * 60 * 12)

            const cr = await generateRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, 0, 300, inValidStartTime)
            //console.log(cr)

            await expect(contract.connect(user1).mintWithSignature(
                cr.typedData.message, cr.signature)).to.be.revertedWith('Request expired')
        })

        it("should not allow a signature to be used after the expiry time", async function () {

            // Mint a city token via signature mint

            // check that our admin has the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)

            // set an end time 12 hours before now
            const validSartTime = Math.floor((await getCurrentBlockTime()) - 60 * 60 * 24)
            const inValidEndTime = Math.floor((await getCurrentBlockTime()) - 60 * 60 * 12)

            const cr = await generateRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1.address, 0, 300, validSartTime, inValidEndTime)
            //console.log(cr)

            await expect(contract.connect(user1).mintWithSignature(
                cr.typedData.message, cr.signature)).to.be.revertedWith('Request expired')
        })
    })

    describe("Signature Burning", function () {

        let contract
        let INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER
        let targetAddress, user2
        let royaltyRecipient, primarySaleRecipient
        let cr // use the same request to mint and burn token

        before(async function () {
            [INITIAL_DEFAULT_ADMIN_AND_SIGNER, NEW_SIGNER, targetAddress, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
        })

        beforeEach(async function () {
            contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
            //console.log('\tlazy minting 60 city tokens...')
            await contract.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Cities"))

            // generate a mint request and mint a token
            cr = await generateRequest(contract.target, INITIAL_DEFAULT_ADMIN_AND_SIGNER, targetAddress.address, 0, 300)
            // check that the signature checks out by calling verify - using the same request that was used to mint
            const recovered = await contract.verify(cr.typedData.message, cr.signature)
            expect(recovered[0]).to.equal(true)
            
            // mint a token with the request
            const tx = await contract.connect(targetAddress).mintWithSignature(cr.typedData.message, cr.signature)
            // check that the token was issued to the correct address
            expect(await contract.balanceOf(targetAddress.address, 0)).to.equal(300)
        })

        it("should allow a user to burn tokens with signature", async function () {

            // burn tokens using same request used to mint
            const tx = await contract.connect(targetAddress).burnWithSignature(cr.typedData.message, cr.signature)

            // check that the tokens are no longer in recipient address
            expect(await contract.balanceOf(targetAddress.address, 0)).to.equal(0)
        })

        it("should not allow a user to burn someone else's tokens", async function () {

            // burn tokens using same request used to mint
            await expect(contract.connect(user2).burnWithSignature(
                cr.typedData.message, cr.signature)).to.be.revertedWith('INSUFFICIENT_BAL')

            // check that the tokens are still in recipient address
            expect(await contract.balanceOf(targetAddress.address, 0)).to.equal(300)

        })
    })

})
