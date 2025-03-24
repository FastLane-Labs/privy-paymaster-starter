import { Chain, Hex } from "viem";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
const SHBUNDLER_URL = process.env.NEXT_PUBLIC_SHBUNDLER_URL as string;
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL as string;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY as Hex;
const ADDRESS_HUB = process.env.NEXT_PUBLIC_ADDRESS_HUB as Hex;
const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS as Hex;
const SPONSOR_WALLET_PRIVATE_KEY = process.env.NEXT_PUBLIC_SPONSOR_WALLET_PRIVATE_KEY as Hex;

const CHAIN_ID = 10143;
const MIN_BONDED_BALANCE = BigInt(100000000000000000);

const CHAIN: Chain = {
  id: Number(CHAIN_ID),
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com/" },
  },
};

export {
  CHAIN_ID,
  CHAIN,
  RPC_URL,
  SHBUNDLER_URL,
  PRIVATE_KEY,
  ADDRESS_HUB,
  PAYMASTER_URL,
  MIN_BONDED_BALANCE,
  SPONSOR_WALLET_PRIVATE_KEY,
  PAYMASTER_ADDRESS,
};
