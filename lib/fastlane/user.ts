import { createPublicClient, createWalletClient, Hex, http, type PublicClient, type WalletClient } from "viem";
import {
  CHAIN,
  RPC_URL,
  PAYMASTER_URL,
  PRIVATE_KEY,
  SHBUNDLER_URL,
  SPONSOR_WALLET_PRIVATE_KEY, 
} from "./constants";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createBundlerClient, entryPoint07Address, type BundlerClient, type PaymasterClient, type SmartAccount } from "viem/account-abstraction";
import { createPaymasterClient } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient, type SmartAccountClient } from "permissionless/clients";


// EOA
const EOA = privateKeyToAccount(PRIVATE_KEY);

// user client
const userClient = createWalletClient({
  chain: CHAIN,
  transport: http(RPC_URL),
  account: EOA,
}) as WalletClient;

// public client
const publicClient = createPublicClient({
  transport: http(RPC_URL),
  chain: CHAIN,
}) as PublicClient;

// paymaster client
const paymasterClient = createPaymasterClient({
  transport: http(PAYMASTER_URL),
}) as PaymasterClient;

// sponsor account
const sponsorEOA = privateKeyToAccount(SPONSOR_WALLET_PRIVATE_KEY as Hex)

// sponsor wallet
const sponsorClient = createWalletClient({
  account: sponsorEOA,
  chain: CHAIN,
  transport: http(RPC_URL)
}) as WalletClient;

// smart wallet
const smartAccount = await toSafeSmartAccount({
  client: publicClient,
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
  owners: [EOA],
  version: "1.4.1"
}) as SmartAccount;

const shBundler = createBundlerClient({
  transport: http(SHBUNDLER_URL),
  name: "shBundler",
  account: smartAccount,
  client: publicClient,
  chain: CHAIN,
  paymaster: paymasterClient
}) as BundlerClient;

const smartAccountClient = createSmartAccountClient({
  account: smartAccount,
  client: publicClient,
  chain: CHAIN,
  bundlerTransport: http(SHBUNDLER_URL),
}) as SmartAccountClient;


export { 
  userClient, 
  publicClient, 
  smartAccount, 
  paymasterClient, 
  sponsorClient, 
  shBundler,
  sponsorEOA,
  smartAccountClient,
};
