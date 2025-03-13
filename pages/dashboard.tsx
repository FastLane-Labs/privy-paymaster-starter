import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { sponsorAccount } from "./api/paymaster";

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
    if (!smartWalletClient) return;
    const to = "0x6c216357a2A5C827dE785f67492d9F90763471B8";
    const userOpHash = await smartWalletClient.sendUserOperation({
      account: smartWalletClient.account,
      calls: [
        {
          to,
          value: 1000000000000000n,
        },
      ],
      paymasterContext: {
        mode: "sponsor",
        address: sponsorAccount?.address,
      },
    });
    console.log("User Operation Hash:", userOpHash);

    const userOpReceipt = await smartWalletClient.waitForUserOperationReceipt({
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
