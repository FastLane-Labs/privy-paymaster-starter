import { NextApiRequest, NextApiResponse } from 'next';
import { PackedUserOperation } from 'viem/account-abstraction';
import { Address, Hex, keccak256, encodeAbiParameters, parseAbiParameters } from 'viem';
import { sponsorClient } from '../../lib/fastlane/user';

// Replace the handler function:
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jsonrpc, id, method, params } = req.body;

    // Validate the JSON-RPC request
    if (jsonrpc !== '2.0' || !id || !method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: { code: -32600, message: 'Invalid request' }
      });
    }
    
    // Handle different RPC methods
    switch (method) {
      case 'backend_getSignature':
        const { userOp, validUntil, validAfter, paymasterAddress, chainId } = params;
        // Convert validUntil and validAfter to BigInt
        const validUntilBigInt = BigInt(validUntil);
        const validAfterBigInt = BigInt(validAfter);

        //chainId is a string, convert to bigint
        const chainIdBigInt = BigInt(chainId);
    
        // convert userOp to PackedUserOperation
        const packedUserOp = userOp as PackedUserOperation;
        
        try {
          const signature = await handleGetSignature(packedUserOp, validUntilBigInt, validAfterBigInt, paymasterAddress as Address, chainIdBigInt);
          return res.status(200).json({
            jsonrpc: "2.0",
            id,
            result: signature
          });
        } catch (error) {
          console.error("Signature error:", error);
          return res.status(500).json({
            jsonrpc: "2.0",
            id,
            error: { code: -32000, message: "Failed to generate signature", data: (error as Error).message }
          });
        }
      
      default:
        return res.status(400).json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        });
    }
  } catch (error) {
    console.error('RPC handler error:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32603, message: 'Internal error', data: (error as Error).message }
    });
  }
}

/**
* Fetches a signature from the sponsor wallet for a user operation.
* @param userOp The user operation to sign
* @param validUntil The end timestamp of the user operation
* @param validAfter The start timestamp of the user operation
* @param paymasterAddress The address of the paymaster contract
* @param chainId The chain ID
*/
export async function handleGetSignature(
  userOp: PackedUserOperation, 
  validUntil: bigint, 
  validAfter: bigint, 
  paymasterAddress: Address, 
  chainId: bigint
): Promise<Hex> {
  const hash = await getHash(
    userOp,
    validUntil,
    validAfter,
    paymasterAddress,
    chainId
  )

  // Sign hash with sponsor wallet
  const sponsorSignature = await sponsorClient.signMessage({
    account: sponsorClient.account!,
    message: { raw: hash },
  });

  return sponsorSignature;
}

/**
 * Gets the hash of the user operation.
 * @param userOp The user operation
 * @param validUntil The end timestamp of the user operation
 * @param validAfter The start timestamp of the user operation
 * @param paymasterAddress The address of the paymaster contract
 * @param chainId The chain ID
 * @returns The hash of the user operation
 */
function getHash(
  userOp: PackedUserOperation,
  validUntil: bigint,
  validAfter: bigint,
  paymasterAddress: Address,
  chainId: bigint
): Hex {
  // Encode the parameters according to the Solidity abi.encode format
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('address, uint256, bytes32, bytes32, bytes32, uint256, address, uint48, uint48'),
      [
        userOp.sender,
        userOp.nonce,
        keccak256(userOp.initCode || '0x'),
        keccak256(userOp.callData),
        userOp.gasFees,
        chainId,
        paymasterAddress,
        Number(validUntil),
        Number(validAfter)
      ]
    )
  );
}