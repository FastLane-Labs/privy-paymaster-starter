import { PackedUserOperation } from "viem/account-abstraction";

interface GetSignatureRequest {
    jsonrpc: "2.0";
    id: number;
    method: "backend_getSignature";
    params: {
      userOp: PackedUserOperation;
      validUntil: number;
      validAfter: number;
      paymasterAddress: string;
      chainId: number;
    };
  }

  export type { GetSignatureRequest };