import { 
  createPublicClient,
  http,
  keccak256,
  toBytes,
  recoverPublicKey,
  recoverAddress,
  toHex } from 'viem'
import { sepolia } from 'viem/chains'
import serializeSignature from 'viem'
import { serializeTransaction } from 'viem/celo'
import secp256k1 from 'secp256k1'

const txHash = '0xefcb5bb3d00a6bde5064bedb00ecb953c85f7d954c16cb5231eb641175bf0d9b'

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

// Function to extract the address associated with to a transaction
async function getPublicKeyFromTransactionHash() {
  // Fetch the transaction using the transaction hash and provier
  const tx = await publicClient.getTransaction({
      hash: txHash
  })

  // Extract the signature (v, r, s) from the transaction
  const { v, r, s } = tx;
  console.log(Number(v))
  console.log(r)
  console.log(s)

  // Ensure v is a number and adjust if needed
  let vn = Number(tx.v);
  if (vn === 0 || vn === 1) {
      vn += 27;  // Adjust to 27 or 28 as Ethereum uses these values
  }

  // Convert hex strings to buffers
  const rBuffer = Buffer.from(tx.r.slice(2), 'hex');
  const sBuffer = Buffer.from(tx.s.slice(2), 'hex');

  console.log('rBuffer', rBuffer);
  console.log('sBuffer', sBuffer);

  // Pad the buffers to 32 bytes
  const rPadded = setLength(rBuffer, 32);
  const sPadded = setLength(sBuffer, 32);

  console.log('rPadded', rPadded);
  console.log('sPadded', sPadded);

  // Concatenate the padded buffers
  const signature = Buffer.concat([rPadded, sPadded], 64);

  console.log('Signature:', signature.toString('hex'));

  // Calculate recovery value
  const recovery = vn - 27;
  if (recovery !== 0 && recovery !== 1) {
      throw new Error('Invalid signature v value');
  }

  console.log('Recovery:', recovery);

// Convert recovery value to Buffer and append
// Fix the finalV to match the correct signature (1b -> 27)
const finalV = 27 // Use the v value directly (27 or 28)
const recoveryBuffer = Buffer.from([finalV]);

const finalSignature = Buffer.concat([signature, recoveryBuffer]);

console.log('Final Signature:', '0x' + finalSignature.toString('hex'));


  // Serialize the transaction
const serializeTransaction = (tx: any) => {
  // Remove any BigInt values before serializing
  const txCopy = { ...tx };
  for (const key in txCopy) {
      if (typeof txCopy[key] === 'bigint') {
          txCopy[key] = txCopy[key].toString();
      }
  }
  return JSON.stringify(txCopy); // Serialize the modified transaction
};

const serializedTx = serializeTransaction(tx);
  const msgHash = keccak256(toBytes(serializedTx))// as specified by ECDSA
  //const msgBytes = toBytes(msgHash) // create binary hash

  const recoveredPubKey = await recoverPublicKey({ hash: msgHash, signature: finalSignature })
  //const recoveredAddress = await recoverAddress({ hash: msgBytes, signature: signature })

  return { recoveredPubKey }

}

// Call the function with a provider and a transaction hash
(async () => {

  // And finally call the function to extract the address associated with the transaction
  const {recoveredPubKey } = await getPublicKeyFromTransactionHash()

  console.log("Public Key:", recoveredPubKey)
  //console.log("Address:", recoveredAddress)
})()

function setLength(buffer: Buffer, length: number): Buffer {
  if (buffer.length > length) {
      throw new Error('Buffer is longer than the specified length');
  }

  if (buffer.length === length) {
      return buffer;
  }

  const paddedBuffer = Buffer.alloc(length);
  buffer.copy(paddedBuffer, length - buffer.length);

  return paddedBuffer;
}