import type { PackedUserOperation } from 'viem/account-abstraction';
import type { GetSignatureRequest } from '../fastlane/types';

interface GetSignatureResponse {
  jsonrpc: "2.0";
  id: number;
  result: string;
  error?: { code: number; message: string };
}

export async function getSignature(
  packedUserOp: PackedUserOperation,
  validUntil: number,
  validAfter: number,
  paymasterAddress: string,
  chainId: number
): Promise<string> {
  const payload: GetSignatureRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "backend_getSignature",
    params: {
      userOp: packedUserOp,
      validUntil,
      validAfter,
      paymasterAddress, 
      chainId
    }
  };

  const response = await fetch('/api/paymaster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload, (key, value) => typeof value === 'bigint' ? value.toString() : value)
  });

  const data: GetSignatureResponse = await response.json();
  if (data.error) {
    throw new Error(`Error from backend: ${data.error.message}`);
  }
  return data.result;
} 