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
        await vault.connect(owner).addAllowedToken(mockERC1155.target)
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
                90, // stakeDays
                1 // stakeId
            )

            //const stakeInfo = await vault.userStakes(addr1.address, 0)
            const tokenAddresses = await vault.getTokenAddresses(addr1.address, 0)
            const tokenIds = await vault.getTokenIds(addr1.address, 0)
            const amounts = await vault.getAmounts(addr1.address, 0)

            /* console.log("stakeInfo:", stakeInfo)
            console.log("tokenAddresses:", tokenAddresses)
            console.log("tokenIds:", tokenIds)
            console.log("amounts:", amounts)
            console.log("stakeTimestamp:", stakeInfo.stakeTimestamp.toString())
            console.log("lockPeriod:", stakeInfo.lockPeriod.toString())
            console.log("id:", stakeInfo.id.toString()) */

            expect(tokenAddresses[0]).to.equal(mockERC1155.target)
            expect(tokenIds[0]).to.equal(0)
            expect(amounts[0]).to.equal(50)

            // Check that the correct event was fired
            await expect(tx).to.emit(vault, 'TokensStaked')
        })

        it("should fail if no tokens are provided", async function () {
            await expect(
                vault.connect(addr1).stake([], [], [], addr1.address, 90, 1)
            ).to.be.revertedWithCustomError(vault, "NoTokensToStake")
        })

        it("should fail if array lengths mismatch", async function () {
            await expect(
                vault.connect(addr1).stake([mockERC1155.target], [], [], addr1.address, 90, 1)
            ).to.be.revertedWithCustomError(vault, "ArrayLengthMismatch")
        })

        it("should fail if minimum stake period is not met", async function () {
            await expect(
                vault.connect(addr1).stake([mockERC1155.target], [0], [50], addr1.address, 89, 1)
            ).to.be.revertedWithCustomError(vault, "MinimumStakePeriodNotMet")
        })

        it("should fail if token is not allowed", async function () {
            mockToken2 = await deployMockToken("MockERC1155", "MCK")
            await mockToken2.mint(addr1.address, 0, 100, "0x")

            await expect(
                vault.connect(addr1).stake([mockToken2.target], [0], [50], addr1.address, 90, 1)
            ).to.be.revertedWithCustomError(vault, "TokenNotAllowed")
        })

        it("should fail if not allowed to stake", async function () {
            await expect(
                vault.connect(addr2).stake([mockERC1155.target], [0], [50], addr1.address, 90, 1)
            ).to.be.revertedWithCustomError(vault, "NotAuthorised")
        })
    })

    describe("Retroactively Staking Tokens", function () {

        it("should retroactively stake tokens successfully", async function () {

            await mockERC1155.mint(addr1.address, 0, 100, "0x")

            // Transfer tokens to the contract
            await mockERC1155.connect(addr1).safeTransferFrom(addr1.address, vault.target, 0, 50, "0x")

            // Retroactively stake the tokens
            /*     
                address[] memory tokens,
                uint256[] memory tokenIds,
                uint256[] memory amounts,
                address staker,
                uint256 daysToLock,
                uint256 id 
            */
            const tx = await vault.connect(addr1).retroactiveStake(
                [mockERC1155.target], // address[] memory tokens,
                [0], // uint256[] memory tokenIds
                [50], // uint256[] memory amounts,
                addr1.address, // address staker,
                90, // uint256 daysToLock,
                1 // uint256 id 
            )

            const tokenAddresses = await vault.getTokenAddresses(addr1.address, 0)
            const tokenIds = await vault.getTokenIds(addr1.address, 0)
            const amounts = await vault.getAmounts(addr1.address, 0)

            expect(tokenAddresses[0]).to.equal(mockERC1155.target)
            expect(tokenIds[0]).to.equal(0)
            expect(amounts[0]).to.equal(50)

            // Check that the correct event was fired
            await expect(tx).to.emit(vault, 'TokensStaked')
        })

        it("should fail if no tokens are provided", async function () {
            await expect(
                vault.connect(addr1).retroactiveStake([], [], [], addr1.address, 90, 1)
            ).to.be.revertedWithCustomError(vault, "NoTokensToStake")
        })

        it("should fail if array lengths mismatch", async function () {
            await expect(
                vault.connect(addr1).retroactiveStake([mockERC1155.target], [], [], addr1.address, 90, 1)
            ).to.be.revertedWithCustomError(vault, "ArrayLengthMismatch")
        })

        it("should fail if minimum stake period is not met", async function () {
            await expect(
                vault.connect(addr1).retroactiveStake([mockERC1155.target], [0], [50], addr1.address, 89, 1)
            ).to.be.revertedWithCustomError(vault, "MinimumStakePeriodNotMet")
        })

        it("should fail if insufficient unstaked balance", async function () {

            await mockERC1155.mint(addr1.address, 0, 100, "0x")

            // Transfer tokens to the contract
            await mockERC1155.connect(addr1).safeTransferFrom(addr1.address, vault.target, 0, 50, "0x")

            await expect(
                vault.connect(addr1).retroactiveStake([mockERC1155.target], [0], [150], addr1.address, 90, 1)
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
                90, // stakeDays
                1 // stakeId
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
                90,
                1
            )
        })

        it("should redeem tokens successfully", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60])
            await ethers.provider.send("evm_mine")

            const tx = await vault.connect(addr1).redeemTokens(addr1.address, 0)

            const balance = await mockERC1155.balanceOf(addr1.address, 0)
            expect(balance).to.equal(100)

            await expect(vault.userStakes(addr1.address, 0)).to.be.reverted

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

            await vault.connect(owner).addAllowedToken(mockToken2.target)
            expect(await vault.allowedTokens(mockToken2.target)).to.equal(true)
        })

        it("should remove allowed token", async function () {
            await vault.connect(owner).removeAllowedToken(mockToken2.target)
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
