import { 
    ThirdwebClient,
    createThirdwebClient,
    getContract
} from "thirdweb"
import { getNFTs } from "thirdweb/extensions/erc1155";
import { baseSepolia } from "thirdweb/chains"
import dotenv from "dotenv"
import fs from 'fs'
 
dotenv.config()

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

console.log(baseSepolia.id)
console.log(contract.address)

const nfts = async () => {
  try {
    const result = await getNFTs({
      contract,
      start: 0,
      count: 10,
    })
    return result;
  } catch (error) {
    throw new Error('Failed to fetch NFTs: ' + error)
  }
}

nfts()
.then((result) => {
    result.forEach((nft) => {
      (nft as any).id = nft.id.toString();
      (nft as any).supply = (nft as any).supply.toString();
    });
    return result;
  })
.then((nfts) => {
// Write the result to a .json file
fs.writeFile('nfts.json', JSON.stringify(nfts), (err) => {
    if (err) {
    console.error('Error writing JSON file:', err);
    } else {
    console.log('NFTs data has been written to nfts.json')
    }
})
})
.catch((error) => {
console.error('Error fetching NFTs:', error)
})
