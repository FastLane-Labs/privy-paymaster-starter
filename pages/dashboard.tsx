import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { encodeFunctionData } from "viem";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  const { client: smartWalletClient } = useSmartWallets();
  const smartWalletAddress = smartWalletClient?.account.address;

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Privy Smart Wallets fDemo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && smartWalletAddress ? (
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
                onClick={() =>
                  smartWalletClient.sendTransaction({
                    to: "0x3331AfB9805ccF5d6cb1657a8deD0677884604A7",
                    data: encodeFunctionData({
                      abi: [
                        {
                          inputs: [
                            {
                              internalType: "address",
                              name: "to",
                              type: "address",
                            },
                          ],
                          name: "mint",
                          outputs: [],
                          stateMutability: "nonpayable",
                          type: "function",
                        },
                      ],
                      functionName: "mint",
                      args: [smartWalletAddress],
                    }),
                  })
                }
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Mint NFT
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
