import { PreparedTransaction } from "thirdweb";
import { lazyMint } from "thirdweb/extensions/erc1155";

const lazyMintTokens = async (contract:any, metadata:any):Promise<PreparedTransaction> => {
  return lazyMint({
    contract,
    nfts: metadata
  })
}

export { lazyMintTokens }