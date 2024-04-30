import { 
    ThirdwebClient,
    createThirdwebClient,
    getContract,
    simulateTransaction,
    sendTransaction,
    waitForReceipt
} from "thirdweb"
import { baseSepolia } from "thirdweb/chains"
import dotenv from "dotenv"
import { ClaimConditionsInput } from "thirdweb/dist/types/utils/extensions/drops/types"
import { setClaimConditions } from "thirdweb/extensions/erc1155"
import { privateKeyToAccount } from "thirdweb/wallets"
 
dotenv.config()

const setClaimConditionsForTokens = async (
    tokenIds: bigint[],
    contract: any,
    conditions: ClaimConditionsInput[],
    simulate: boolean
) => {
    
    // get an account to write to the contract
    const wallet = privateKeyToAccount({
        client,
        privateKey: <string>process.env.PK,
    })

    for (const tokenId of tokenIds) {
        // prepare our transaction
        const tx = setClaimConditions({
            contract,
            tokenId: tokenId as bigint,
            phases: conditions
        });

        const result = simulate
            ? await simulateTransaction({
                transaction:tx,
                account: wallet
              })
            :  await sendTransaction({
                transaction:tx,
                account: wallet
            })

        if (!simulate) {
            const receipt = await waitForReceipt({
                client,
                chain:baseSepolia,
                transactionHash: result.transactionHash
              });
            console.log(`receipt for ${tokenId} mined in block ${receipt.blockNumber}:`, receipt)
        } else {
            console.log(`tx for ${tokenId}:`, result)
        }
    }
}

// create the client with your clientId, or secretKey if in a server environment
const client:ThirdwebClient = createThirdwebClient({
    secretKey: <string>process.env.TW_SECRET_ID
})

// connect to your contract
const contract = getContract({
  client, 
  chain: baseSepolia, 
  address: <string>process.env.CONTRACT_ADDRESS
})



/* const allowlistedAddresses = [
    user1.address,
    user2.address
  ]

const encodedAddresses = new ethers.AbiCoder().encode(
    ['address[]'],
    [allowlistedAddresses]
  )

const preSaleMerkel = ethers.keccak256(encodedAddresses); */

const presaleStartTime = new Date()
const publicSaleStartTime = new Date(Date.now() + 60 * 60 * 24 * 1000) // 24h after presale, start public sale
const claimConditions:ClaimConditionsInput[] = [
    /* {
      startTime: presaleStartTime, // start the presale now
      maxClaimableSupply: 1000n, // limit how many mints for this presale
      priceInWei: ethers.parseUnits("0.01", 18), // presale price
      maxClaimablePerWallet: 5n, // limit how many can be minted per wallet
      //merkleRoot: preSaleMerkel, // the merkle root for the presale
      currencyAddress: ethers.ZeroAddress, // the currency for the presale,
    }, */
    {
      startTime: new Date(), 
      maxClaimableSupply: 9000n, // limit how many mints for this presale
      priceInWei: 0n, // public sale price
      maxClaimablePerWallet: 50n, // limit how many can be minted per wallet
      //merkleRoot: publicSaleMerkel, // the merkle root for the presale
    }
  ]

  // Function to generate an array of BigInts from 0n to maxN
function generateBigIntArray(maxN:number) {
  const result = [];
  for (let i = 0; i <= maxN; i++) {
    result.push(BigInt(i));
  }
  return result;
}

// Call the function to generate the array
const bigIntArray = generateBigIntArray(463);

setClaimConditionsForTokens(bigIntArray, contract, claimConditions, false)