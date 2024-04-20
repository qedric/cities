import { lazyMint } from "thirdweb/extensions/erc1155";
 
const lazyMintTokens = async (contract:any, metadata:any) => {
  try {
    const result:any = lazyMint({
      contract,
      nfts: metadata
    });
    let valueResult = result.value; // Add null check before invoking value()
    valueResult.then((res:any) => {
      console.log(res)
    })

  } catch (error) {
    console.log(error);
    return error;
  }
}


export { lazyMintTokens }