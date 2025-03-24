import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { shBundler, sponsorClient, userClient } from "../lib/fastlane/user";
import { toPackedUserOperation } from "viem/account-abstraction";
import { getSignature } from "../lib/api/getSignature";
import { PAYMASTER_ADDRESS, CHAIN_ID } from "../lib/fastlane/constants";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  const { client: smartWalletClient } = useSmartWallets();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const onSendTransaction = async () => {
    if(!smartWalletClient) return;
    const calls = [
      {
        to: userClient.account!.address,
        value: 1000000000000000n,
      },
    ];
    const userOp = await smartWalletClient.prepareUserOperation({
      account: smartWalletClient.account,
      calls,
    });

    const packedUserOp = toPackedUserOperation(userOp);
    
    // BACKEND SERVICE: START
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const validUntil = currentTime + 3600n;
    const validAfter = 0n;

    const sponsorSignature = await getSignature(
      packedUserOp, 
      Number(validUntil), 
      Number(validAfter), 
      PAYMASTER_ADDRESS, 
      CHAIN_ID
    );
    // BACKEND SERVICE: END
    
    const userOpHash = await shBundler.sendUserOperation({
      account: smartWalletClient.account,
      calls,
      // MUST HAVE SAME NONCE AS PREPARED USER OPERATION
      nonce: userOp.nonce,
      callGasLimit: userOp.callGasLimit,
      verificationGasLimit: userOp.verificationGasLimit,
      preVerificationGas: userOp.preVerificationGas,
      maxFeePerGas: userOp.maxFeePerGas,
      maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
      paymasterContext: {
        mode: "sponsor",
        sponsor: sponsorClient.account!.address,
        sponsorSignature,
        validUntil: validUntil.toString(),
        validAfter: validAfter.toString()
      }
    });
    
    const userOpReceipt = await shBundler.waitForUserOperationReceipt({
      hash: userOpHash,
    });
    console.log("User Operation Receipt:", userOpReceipt);
  };

  return (
    <>
      <Head>
        <title>Privy Smart Wallets Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && smartWalletClient ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">
                Privy Smart Wallets Demo
              </h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap"> 
              <button
                onClick={onSendTransaction}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Send Transaction
              </button>
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}
