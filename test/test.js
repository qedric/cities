const { expect } = require("chai")
const { ethers } = require("hardhat")
//const cities = require("../data/cities.json")

//console.log(cities.length)

const { deployContract, getCurrentBlockTime, generateRequest, deployMockToken } = require("./test_helpers.js")

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe(" -- Testing Farconic CITIES -- ", function () {

    describe("Configuration & Permissions", function () {

        // write tests for the following:
        /* 
          mapping(uint256 => uint256) public totalSupply
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
            //await contract.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Cities"))
        })

        it("should allow a user to mint tokens with signature", async function () {

            /*
                struct Request {
                    address[] targetAddresses
                    uint256[] amounts
                    uint256 tokenId
                    string tokenURI
                    uint128 validityStartTimestamp
                    uint128 validityEndTimestamp
                } 
            */

            // -- Mint a city token via signature mint --

            // check that our admin has the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)

            const cr = await generateRequest(
                contract.target,
                INITIAL_DEFAULT_ADMIN_AND_SIGNER,
                "ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/",
                [user1.address],
                [1]
            )

            // check that the signature checks out by calling verify 
            const recovered = await contract.verify(cr.typedData.message, cr.signature)
            //console.log('\tcontract-signature-verified:', recovered)
            expect(recovered[0]).to.equal(true)

            const tx = await contract.connect(user1).mintWithSignature(cr.typedData.message, cr.signature)
            const receipt = await tx.wait()

            // Check if logs are present in the receipt
            if (receipt.logs) {
                // Use the contract interface to parse the logs
                const events = receipt.logs.map(log => contract.interface.parseLog(log))
                events.filter(event => event.name === "TokensMintedWithSignature").forEach(event => {
                    //console.log('event args:', event.args)
                    //console.log('signer:', event.args[0])

                    try {
                        
                        const actualAmounts = event.args[3].map((amount) => amount.toString());
                    
                        //console.log('tokenId:', event.args[2]);
                        //console.log('amounts:', actualAmounts);
                        //console.log('expected amounts:', ['1']);
                    
                        // Compare actual and expected values
                        expect(actualAmounts).to.deep.equal(['1']);
                    } catch (error) {
                        console.error('Error decoding events:', error);
                    }
                })
            } else {
                console.log('No logs found in the receipt')
            }

            // check that the token was issued to the correct address
            expect(await contract.balanceOf(user1.address, 0)).to.equal(1)

        })

        it("should allow a token to be minted to multiple users", async function () {
            // -- Mint a city token via signature mint --
            // check that our admin has the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), INITIAL_DEFAULT_ADMIN_AND_SIGNER.address)).to.equal(true)

            const cr = await generateRequest(
                contract.target,
                INITIAL_DEFAULT_ADMIN_AND_SIGNER,
                "ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/",
                [user1.address, user2.address], 
                [1, 3]
            )
            //console.log(cr.typedData.message)

            // check that the signature checks out by calling verify 
            const recovered = await contract.verify(cr.typedData.message, cr.signature)
            //console.log('\tcontract-signature-verified:', recovered)
            expect(recovered[0]).to.equal(true)

            const tx = await contract.connect(user1).mintWithSignature(cr.typedData.message, cr.signature)

            // check that the token was issued to the correct address
            expect(await contract.balanceOf(user1.address, 0)).to.equal(1)

            // check that the token was issued to the correct address
            expect(await contract.balanceOf(user2.address, 0)).to.equal(3)

            // Check if logs are present in the receipt
            const receipt = await tx.wait()
            if (receipt.logs) {
                // Use the contract interface to parse the logs
                const events = receipt.logs.map(log => contract.interface.parseLog(log))
                events.filter(event => event.name === "TokensMintedWithSignature").forEach(event => {

                    try {
                        const actualAmounts = event.args[3].map((amount) => amount.toString());
                        // Compare actual and expected values
                        expect(actualAmounts).to.deep.equal(['1', '3']);
                    } catch (error) {
                        console.error('Error decoding events:', error);
                    }

                })
            } else {
                console.log('No logs found in the receipt')
            }

            // Check that the correct event was fired
            await expect(tx).to.emit(contract, 'TokensMintedWithSignature')

        })

        it("should not allow a user without the MINTER_ROLE to sign a request", async function () {

            // Try to claim a city token via signature mint with unapproved signer

            // check that our admin doesn NOT have the MINTER_ROLE
            expect(await contract.hasRole(await contract.MINTER_ROLE(), user2.address)).to.equal(false)

            // generate claim request with unauthorised signer
            const cr = await generateRequest(
                contract.target,
                user2,
                "ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/",
                [user1.address],
                [1]
            )
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

            const cr = await generateRequest(
                contract.target,
                INITIAL_DEFAULT_ADMIN_AND_SIGNER,
                "ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/",
                [user1.address, user2.address], 
                [1, 1],
                inValidStartTime
            )
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

            const cr = await generateRequest(
                contract.target,
                INITIAL_DEFAULT_ADMIN_AND_SIGNER,
                "ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/",
                [user1.address, user2.address], 
                [1, 1],
                validSartTime,
                inValidEndTime
            )
            //console.log(cr)

            await expect(contract.connect(user1).mintWithSignature(
                cr.typedData.message, cr.signature)).to.be.revertedWith('Request expired')
        })
    })

    describe("Signature Burning", function () {

        let contract
        let INITIAL_DEFAULT_ADMIN_AND_SIGNER
        let user1, user2
        let royaltyRecipient, primarySaleRecipient
        let cr // use the same request to mint and burn token

        before(async function () {
            [INITIAL_DEFAULT_ADMIN_AND_SIGNER, user1, user2, royaltyRecipient, primarySaleRecipient] = await ethers.getSigners()
        })

        beforeEach(async function () {
            contract = await deployContract(INITIAL_DEFAULT_ADMIN_AND_SIGNER, royaltyRecipient, 10_000, primarySaleRecipient)
            //console.log('\tlazy minting 60 city tokens...')
            //await contract.lazyMint(60, `ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/`, ethers.toUtf8Bytes("Cities"))

            // generate a mint request and mint a token
            cr = await generateRequest(
                contract.target,
                INITIAL_DEFAULT_ADMIN_AND_SIGNER,
                "ipfs://QmRczWjARcZHB9pJ3aK7F3YdJfYf8UjPXW3FWLWychhdnZ/",
                [user1.address],
                [1]
            )
            // check that the signature checks out by calling verify - using the same request that was used to mint
            const recovered = await contract.verify(cr.typedData.message, cr.signature)
            expect(recovered[0]).to.equal(true)
            
            // mint a token with the request
            const tx = await contract.connect(user1).mintWithSignature(cr.typedData.message, cr.signature)
            // check that the token was issued to the correct address
            expect(await contract.balanceOf(user1.address, 0)).to.equal(1)
        })

        it("should allow a user to burn tokens with signature", async function () {

            // burn tokens using same request used to mint
            const tx = await contract.connect(user1).burnWithSignature(cr.typedData.message, cr.signature)

            // check that the tokens are no longer in recipient address
            expect(await contract.balanceOf(user1.address, 0)).to.equal(0)

            /* event TokensBurnedWithSignature(
                address indexed signer,
                address[] indexed holders,
                uint256 indexed tokenId,
                uint256[] amounts
            ) */

            const receipt = await tx.wait()
            if (receipt.logs) {
                // Use the contract interface to parse the logs
                const events = receipt.logs.map(log => contract.interface.parseLog(log))
                events.filter(event => event.name === "TokensMintedWithSignature").forEach(event => {

                    try {
                        console.log('event args:', event.args)
                        const actualAmounts = event.args[3].map((amount) => amount.toString())
                        // Compare actual and expected values
                        expect(actualAmounts).to.deep.equal(['1'])
                    } catch (error) {
                        console.error('Error decoding events:', error)
                    }

                })
            } else {
                console.log('No logs found in the receipt')
            }

            // Check that the correct event was fired
            await expect(tx).to.emit(contract, 'TokensBurnedWithSignature')
        })

        it("should allow a user to burn someone else's tokens", async function () {

            // burn tokens using same request used to mint
            const tx = await contract.connect(user2).burnWithSignature(cr.typedData.message, cr.signature)
            const receipt = await tx.wait()
            if (receipt.logs) {
                // Use the contract interface to parse the logs
                const events = receipt.logs.map(log => contract.interface.parseLog(log))
                events.filter(event => event.name === "TokensBurnedWithSignature").forEach(event => {

                    //console.log('event args:', event.args)

                    try {
                        const actualAmounts = event.args[3].map((amount) => amount.toString())
                        // Compare actual and expected values
                        expect(actualAmounts).to.deep.equal(['1'])
                    } catch (error) {
                        console.error('Error decoding events:', error)
                    }

                })
            } else {
                console.log('No logs found in the receipt')
            }

            // check that the tokens are gone from recipient address
            expect(await contract.balanceOf(user1.address, 0)).to.equal(0)

            // Check that the correct event was fired
            await expect(tx).to.emit(contract, 'TokensBurnedWithSignature')
        })
    })

})

describe(" -- Testing Farconic VAULT -- ", function () {

    let Vault, vault, owner, addr1, addr2, mockERC1155, mockToken2

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners()

        // Deploy a mock ERC1155 token
        mockERC1155 = await deployMockToken("MockERC1155", "MCK") 

        // Deploy the Vault contract
        Vault = await ethers.getContractFactory("Vault")
        vault = await Vault.deploy(owner.address)
        await vault.waitForDeployment()

        // Add the mock token to the allowed tokens list
        await vault.connect(owner).addAllowedTokens([mockERC1155.target])
    })

    describe("Stake Tokens", function () {

        it("should stake tokens successfully", async function () {

            await mockERC1155.mint(addr1.address, 0, 100, "0x")
            // Add this line to approve the Vault contract
            await mockERC1155.connect(addr1).setApprovalForAll(vault.target, true)

            const tx = await vault.connect(addr1).stake(
                [mockERC1155.target], // tokenAddresses
                [0], // tokenIds
                [50], // amounts
                addr1.address, // staker
                90 // stakeDays
            )

            const totalStakedMapping = await vault.stakedBalance(addr1.address, mockERC1155.target, 0)

            expect(totalStakedMapping).to.equal(50)

            // Check that the correct event was fired
            await expect(tx).to.emit(vault, 'TokensStaked')

            const userStakes = await vault.getUserStakes(addr1.address)
            //console.log("userStakes:", userStakes[0])
            expect(userStakes.length).to.equal(1)

            // get the TokensStaked event from the receipt and confirm all values
            const receipt = await tx.wait()
            const events = receipt.logs.map(log => vault.interface.parseLog(log))
            //console.log("events:", events)
            events.filter(event => event?.name === "TokensStaked").forEach(event => {

                /* console.log("event args:", event.args)
                console.log("event args user:", event.args.user)
                console.log("event args operator:", event.args.operator)
                console.log("event args stakeInfo:", event.args.stakeInfo)  
                console.log("event args stakeInfo tokenAddress:", event.args.stakeInfo[0])
                console.log("event args stakeInfo tokenId:", event.args.stakeInfo[1])
                console.log("event args stakeInfo amount:", event.args.stakeInfo[2])
                console.log("event args stakeInfo timestamp:", event.args.stakeInfo[3])
                console.log("event args stakeInfo lockPeriod:", event.args.stakeInfo[4]) */

                expect(event.args.user).to.equal(addr1.address)
                expect(event.args.operator).to.equal(addr1.address)
                expect(event.args.stakeInfo[0][0]).to.equal(mockERC1155.target)
                expect(event.args.stakeInfo[1][0]).to.equal(0)
                expect(event.args.stakeInfo[2][0]).to.equal(50)
                expect(event.args.stakeInfo[4]).to.equal(90 * 24 * 60 * 60) // 90 days in seconds

            })

        })

        it("should fail if no tokens are provided", async function () {
            await expect(
                vault.connect(addr1).stake([], [], [], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "NoTokensToStake")
        })

        it("should fail if array lengths mismatch", async function () {
            await expect(
                vault.connect(addr1).stake([mockERC1155.target], [], [], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "ArrayLengthMismatch")
        })

        it("should fail if minimum stake period is not met", async function () {
            await expect(
                vault.connect(addr1).stake([mockERC1155.target], [0], [50], addr1.address, 89)
            ).to.be.revertedWithCustomError(vault, "MinimumStakePeriodNotMet")
        })

        it("should fail if token is not allowed", async function () {
            mockToken2 = await deployMockToken("MockERC1155", "MCK")
            await mockToken2.mint(addr1.address, 0, 100, "0x")

            await expect(
                vault.connect(addr1).stake([mockToken2.target], [0], [50], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "TokenNotAllowed")
        })

        it("should fail if not allowed to stake", async function () {
            await expect(
                vault.connect(addr2).stake([mockERC1155.target], [0], [50], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "NotAuthorised")
        })

        it("should allow batch staking of multiple tokens", async function () {

            // create several mock tokens
            const mockToken2 = await deployMockToken("MockERC1155", "MCK")
            const mockToken3 = await deployMockToken("MockERC1155", "MCK")

            // mint tokens to owner
            await mockERC1155.mint(owner.address, 0, 100, "0x")
            await mockToken2.mint(owner.address, 0, 100, "0x")
            await mockToken3.mint(owner.address, 0, 100, "0x")
            await mockERC1155.mint(owner.address, 10, 100, "0x")
            await mockToken2.mint(owner.address, 10, 100, "0x")
            await mockToken3.mint(owner.address, 10, 100, "0x")

            // approve vault for all tokens
            await mockERC1155.connect(owner).setApprovalForAll(vault.target, true)
            await mockToken2.connect(owner).setApprovalForAll(vault.target, true)
            await mockToken3.connect(owner).setApprovalForAll(vault.target, true)

            // approve the tokens to be staked
            await vault.connect(owner).addAllowedTokens([mockERC1155.target, mockToken2.target, mockToken3.target])

            expect(await mockERC1155.isApprovedForAll(owner.address, vault.target)).to.equal(true)
            expect(await mockToken2.isApprovedForAll(owner.address, vault.target)).to.equal(true)
            expect(await mockToken3.isApprovedForAll(owner.address, vault.target)).to.equal(true)

            // now we should be able to stake all of them
            await vault.connect(owner).stake(
                [mockERC1155.target, mockToken2.target, mockToken3.target, mockERC1155.target, mockToken2.target, mockToken3.target],
                [0, 0, 0, 10, 10, 10],
                [100, 100, 100, 100, 100, 100],
                owner.address,
                90
            )

            // check that the tokens are staked
            expect(await mockERC1155.balanceOf(vault.target, 0)).to.equal(100)
            expect(await mockToken2.balanceOf(vault.target, 0)).to.equal(100)
            expect(await mockToken3.balanceOf(vault.target, 0)).to.equal(100)
            expect(await mockERC1155.balanceOf(vault.target, 10)).to.equal(100)
            expect(await mockToken2.balanceOf(vault.target, 10)).to.equal(100)
            expect(await mockToken3.balanceOf(vault.target, 10)).to.equal(100)


        })
    })

    describe("Retroactively Staking Tokens", function () {

        it("should retroactively stake tokens successfully", async function () {

            await mockERC1155.mint(addr1.address, 0, 100, "0x")

            // Transfer tokens to the contract
            await mockERC1155.connect(addr1).safeTransferFrom(addr1.address, vault.target, 0, 50, "0x")

            let stakedTokenBalance = await vault.stakedBalance(addr1.address, mockERC1155.target, 0)
            expect(stakedTokenBalance).to.equal(0)

            // check unstaked balance
            let unStakedTokenBalance = await vault.unstakedBalance(addr1.address, mockERC1155.target, 0)
            expect(unStakedTokenBalance).to.equal(50)
 
            // Retroactively stake the tokens
            const tx = await vault.connect(addr1).retroactiveStake(
                [mockERC1155.target], // address[] memory tokens,
                [0], // uint256[] memory tokenIds
                [50], // uint256[] memory amounts,
                addr1.address, // address staker,
                90 // uint256 daysToLock,
            )

            stakedTokenBalance = await vault.stakedBalance(addr1.address, mockERC1155.target, 0)
            expect(stakedTokenBalance).to.equal(50)

            // check unstaked balance
            unStakedTokenBalance = await vault.unstakedBalance(addr1.address, mockERC1155.target, 0)
            expect(unStakedTokenBalance).to.equal(0)

            // Check that the correct event was fired
            await expect(tx).to.emit(vault, 'TokensStaked')
        })

        it("should fail if no tokens are provided", async function () {
            await expect(
                vault.connect(addr1).retroactiveStake([], [], [], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "NoTokensToStake")
        })

        it("should fail if array lengths mismatch", async function () {
            await expect(
                vault.connect(addr1).retroactiveStake([mockERC1155.target], [], [], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "ArrayLengthMismatch")
        })

        it("should fail if minimum stake period is not met", async function () {
            await expect(
                vault.connect(addr1).retroactiveStake([mockERC1155.target], [0], [50], addr1.address, 89)
            ).to.be.revertedWithCustomError(vault, "MinimumStakePeriodNotMet")
        })

        it("should fail if insufficient unstaked balance", async function () {

            await mockERC1155.mint(addr1.address, 0, 100, "0x")

            // Transfer tokens to the contract
            await mockERC1155.connect(addr1).safeTransferFrom(addr1.address, vault.target, 0, 50, "0x")

            await expect(
                vault.connect(addr1).retroactiveStake([mockERC1155.target], [0], [150], addr1.address, 90)
            ).to.be.revertedWithCustomError(vault, "InsufficientBalance")
        })

        it("should fail to redeem tokens that have not been staked yet", async function () {

            await mockERC1155.mint(addr1.address, 0, 100, "0x")

             // Add this line to approve the Vault contract
             await mockERC1155.connect(addr1).setApprovalForAll(vault.target, true)

            // stake some of the tokens directly
            const tx = await vault.connect(addr1).stake(
                [mockERC1155.target], // tokenAddresses
                [0], // tokenIds
                [60], // amounts
                addr1.address, // staker
                90 // stakeDays
            )

            // Verify that the staked balance is correct
            let vaultBalance = await mockERC1155.balanceOf(vault.target, 0)
            expect(vaultBalance).to.equal(60)

            // Verify that the user's balance is correct
            let userBalance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(userBalance).to.equal(40)

            // Transfer the rest of the tokens to the contract
            await mockERC1155.connect(addr1).safeTransferFrom(addr1.address, vault.target, 0, 40, "0x")

            // now total balance should equal staked + unstaked
            vaultBalance = await mockERC1155.balanceOf(vault.target, 0)
            expect(vaultBalance).to.equal(100)

            // Verify that the user's balance is correct
            userBalance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(userBalance).to.equal(0)

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60])
            await ethers.provider.send("evm_mine")
            
            // Redeem first tokens
            await vault.connect(addr1).redeemTokens(addr1.address, 0)
            
            // now total balance should equal only unstaked
            vaultBalance = await mockERC1155.balanceOf(vault.target, 0)
            expect(vaultBalance).to.equal(40)

            // Verify that the user's balance is correct
            userBalance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(userBalance).to.equal(60)
        })

        it("should allow batch retro-staking of multiple tokens", async function () {

            // create several mock tokens
            const mockToken2 = await deployMockToken("MockERC1155", "MCK")
            const mockToken3 = await deployMockToken("MockERC1155", "MCK")

            // mint tokens to owner
            await mockERC1155.mint(owner.address, 0, 100, "0x")
            await mockToken2.mint(owner.address, 0, 100, "0x")
            await mockToken3.mint(owner.address, 0, 100, "0x")
            await mockERC1155.mint(owner.address, 10, 100, "0x")
            await mockToken2.mint(owner.address, 10, 100, "0x")
            await mockToken3.mint(owner.address, 10, 100, "0x")

            // approve vault for all tokens
            await mockERC1155.connect(owner).setApprovalForAll(vault.target, true)
            await mockToken2.connect(owner).setApprovalForAll(vault.target, true)
            await mockToken3.connect(owner).setApprovalForAll(vault.target, true)

            // approve the tokens to be staked
            await vault.connect(owner).addAllowedTokens([mockERC1155.target, mockToken2.target, mockToken3.target])

            expect(await mockERC1155.isApprovedForAll(owner.address, vault.target)).to.equal(true)
            expect(await mockToken2.isApprovedForAll(owner.address, vault.target)).to.equal(true)
            expect(await mockToken3.isApprovedForAll(owner.address, vault.target)).to.equal(true)

            // stake some of the tokens directly
            await vault.connect(owner).stake(
                [mockERC1155.target, mockToken2.target, mockToken3.target, mockERC1155.target, mockToken2.target, mockToken3.target],
                [0, 0, 0, 10, 10, 10],
                [60, 60, 60, 60, 60, 60],
                owner.address,
                90
            )

            let userStakes = await vault.getUserStakes(owner.address)

            // check that the tokens are staked by checking stakeInfo
            expect(userStakes.length).to.equal(1)

            let stakedBalance = await vault.stakedBalance(owner.address, mockERC1155.target, 0)
            expect(stakedBalance).to.equal(60)

            // check vault balance
            expect(await mockERC1155.balanceOf(vault.target, 0)).to.equal(60)
            expect(await mockToken2.balanceOf(vault.target, 0)).to.equal(60)
            expect(await mockToken3.balanceOf(vault.target, 0)).to.equal(60)
            expect(await mockERC1155.balanceOf(vault.target, 10)).to.equal(60)
            expect(await mockToken2.balanceOf(vault.target, 10)).to.equal(60)
            expect(await mockToken3.balanceOf(vault.target, 10)).to.equal(60)

            // check user balance
            expect(await mockERC1155.balanceOf(owner.address, 0)).to.equal(40)
            expect(await mockToken2.balanceOf(owner.address, 0)).to.equal(40)
            expect(await mockToken3.balanceOf(owner.address, 0)).to.equal(40)
            expect(await mockERC1155.balanceOf(owner.address, 10)).to.equal(40)
            expect(await mockToken2.balanceOf(owner.address, 10)).to.equal(40)
            expect(await mockToken3.balanceOf(owner.address, 10)).to.equal(40)

            // send the rest of the tokens to the contract
            await mockERC1155.connect(owner).safeTransferFrom(owner.address, vault.target, 0, 40, "0x")
            await mockToken2.connect(owner).safeTransferFrom(owner.address, vault.target, 0, 40, "0x")
            await mockToken3.connect(owner).safeTransferFrom(owner.address, vault.target, 0, 40, "0x")
            await mockERC1155.connect(owner).safeTransferFrom(owner.address, vault.target, 10, 40, "0x")
            await mockToken2.connect(owner).safeTransferFrom(owner.address, vault.target, 10, 40, "0x")
            await mockToken3.connect(owner).safeTransferFrom(owner.address, vault.target, 10, 40, "0x")

            // check user balance
            expect(await mockERC1155.balanceOf(owner.address, 0)).to.equal(0)
            expect(await mockToken2.balanceOf(owner.address, 0)).to.equal(0)
            expect(await mockToken3.balanceOf(owner.address, 0)).to.equal(0)
            expect(await mockERC1155.balanceOf(owner.address, 10)).to.equal(0)
            expect(await mockToken2.balanceOf(owner.address, 10)).to.equal(0)
            expect(await mockToken3.balanceOf(owner.address, 10)).to.equal(0)

            // check vault balance
            expect(await mockERC1155.balanceOf(vault.target, 0)).to.equal(100)
            expect(await mockToken2.balanceOf(vault.target, 0)).to.equal(100)
            expect(await mockToken3.balanceOf(vault.target, 0)).to.equal(100)
            expect(await mockERC1155.balanceOf(vault.target, 10)).to.equal(100)
            expect(await mockToken2.balanceOf(vault.target, 10)).to.equal(100)
            expect(await mockToken3.balanceOf(vault.target, 10)).to.equal(100)

            // retroactively stake the tokens
            await vault.connect(owner).retroactiveStake(
                [mockERC1155.target, mockToken2.target, mockToken3.target, mockERC1155.target, mockToken2.target, mockToken3.target],
                [0, 0, 0, 10, 10, 10],
                [40, 40, 40, 40, 40, 40],
                owner.address,
                90
            )

            // check that the tokens are staked by checking stakeInfo
            userStakes = await vault.getUserStakes(owner.address)
            expect(userStakes.length).to.equal(2)

            stakedBalance = await vault.stakedBalance(owner.address, mockERC1155.target, 0)
            expect(stakedBalance).to.equal(100)
            
            //console.log("userStakes:", userStakes)
        })
    })

    describe("Redeem Tokens", function () {
        beforeEach(async function () {
            await mockERC1155.mint(addr1.address, 0, 100, "0x")
            // Add this line to approve the Vault contract
            await mockERC1155.connect(addr1).setApprovalForAll(vault.target, true)

            await vault.connect(addr1).stake(
                [mockERC1155.target],
                [0],
                [50],
                addr1.address,
                90
            )
        })

        it("should redeem tokens successfully", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60])
            await ethers.provider.send("evm_mine")

            let balance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(balance).to.equal(50)

            // stake 50 more tokens
            await vault.connect(addr1).stake(
                [mockERC1155.target],
                [0],
                [50],
                addr1.address,
                90
            )

            balance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(balance).to.equal(0)

            const tx = await vault.connect(addr1).redeemTokens(addr1.address, 0)

            balance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(balance).to.equal(50)

            // Check that the correct event was fired
            await expect(tx).to.emit(vault, 'TokensRedeemed')
        })

        it("should fail if no stakes found", async function () {
            await expect(
                vault.connect(addr2).redeemTokens(addr2.address, 0)
            ).to.be.revertedWithCustomError(vault, "NotFound")
        })

        it("should fail if invalid stake index", async function () {
            await expect(
                vault.connect(addr1).redeemTokens(addr1.address, 1)
            ).to.be.revertedWithCustomError(vault, "InvalidStakeIndex")
        })

        it("should fail if tokens are still locked", async function () {
            await expect(
                vault.connect(addr1).redeemTokens(addr1.address, 0)
            ).to.be.revertedWithCustomError(vault, "MinimumStakePeriodNotMet")
        })

        it("should fail if not allowed to redeem", async function () {
            await expect(
                vault.connect(addr2).redeemTokens(addr1.address, 0)
            ).to.be.revertedWithCustomError(vault, "NotAuthorised")
        })
    })

    describe("Admin Functions", function () {
        it("should set minimum stake days", async function () {
            await vault.connect(owner).setMinStakeDays(30)
            expect(await vault.min_stake_days()).to.equal(30)
        })

        it("should fail to set minimum stake days if not admin", async function () {
            await expect(
                vault.connect(addr1).setMinStakeDays(30)
            ).to.be.revertedWithCustomError(vault, "PermissionsUnauthorizedAccount").withArgs(addr1.address, DEFAULT_ADMIN_ROLE)
        })

        it("should add allowed token", async function () {
            mockToken2 = await deployMockToken("MockERC1155", "MCK")
            await mockToken2.mint(addr1.address, 0, 100, "0x")

            await vault.connect(owner).addAllowedTokens([mockToken2.target])
            expect(await vault.allowedTokens(mockToken2.target)).to.equal(true)
        })

        it("should remove allowed token", async function () {
            await vault.connect(owner).removeAllowedTokens([mockToken2.target])
            expect(await vault.allowedTokens(mockToken2.target)).to.equal(false)
        })
    })

    describe("Fallback and Receive", function () {
        it("should revert on receive", async function () {
            await expect(
                addr1.sendTransaction({ to: vault.target, value: ethers.parseEther("1") })
            ).to.be.revertedWithCustomError(vault, "ETHNotAccepted")
        })

        it("should revert on fallback", async function () {
            await expect(
                addr1.sendTransaction({ to: vault.target, data: "0x1234" })
            ).to.be.revertedWithCustomError(vault, "ETHNotAccepted")
        })
    })

})
