import {
  buildMultichainReadonlyClient,
  buildRpcInfo,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
} from "klaster-sdk";
import { createWalletClient, custom, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { optimismSepolia, arbitrumSepolia } from "viem/chains";

import { BalanceError, getRoutes, RoutesRequest } from "@lifi/sdk";
import { Address, batchTx, BridgePlugin, rawTx } from "klaster-sdk";
import { Hex } from "viem";
 
// When in browser environment create a signer
// which uses the injected wallet (e.g. MetaMask, Rabby, ...)
const signer = createWalletClient({
  transport: custom((window as any).ethereum),
});
 
// When in non-browser environment you can use private key
// to sign messages.
const privateKey = generatePrivateKey();
const signerAccount = privateKeyToAccount(privateKey);
const signer = createWalletClient({
  transport: http(),
});

const [address] = await signer.getAddresses();

const klaster = await initKlaster({
  accountInitData: loadBicoV2Account({
    owner: address, // Fetch
  }),
  nodeUrl: klasterNodeHost.default,
});

 //multi chain (add more when/if required)
const mcClient = buildMultichainReadonlyClient(
  [optimismSepolia, arbitrumSepolia].map((x) => {
    return {
      chainId: x.id,
      rpcUrl: x.rpcUrls.default.http[0],
    };
  })
);

//map equivalent tokens
const mcUSDC = buildTokenMapping([
  deployment(optimismSepolia.id, "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"),
  deployment(arbitrumSepolia.id, "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"),
]);


export const liFiBrigePlugin: BridgePlugin = async (data) => {
 
  const routesRequest: RoutesRequest = {
    fromChainId: data.sourceChainId,
    toChainId: data.destinationChainId,
    fromTokenAddress: data.sourceToken,
    toTokenAddress: data.destinationToken,
    fromAmount: data.amount.toString(),
    options: {
      order: "FASTEST",
    },
  };
 
  const result = await getRoutes(routesRequest);
  const route = result.routes.at(0)
 
  if (!route) {
    throw Error('...');
  }
 
  const routeSteps = route.steps.map(step => {
    if(!step.transactionRequest) { throw Error('...') }
    const { to, gasLimit, data, value} = step.transactionRequest
    if(!to || !gasLimit || !data || !value) { throw Error('...') } 
    return rawTx({
      to: to as Address,
      gasLimit: BigInt(gasLimit),
      data: data as Hex,
      value: BigInt(value)
    })
  })
 
  return {
    receivedOnDestination: BigInt(route.toAmountMin),
    txBatch: batchTx(data.sourceChainId, routeSteps)
  }
};

const uBalance = await mcClient.getUnifiedErc20Balance({
  tokenMapping: mUSDC,
  account: klaster.account,
});
 
// Total balance across all used chains, expressed in base units
uBalance.balance;
 
// Breakdown of balances across each separate blockchain
uBalance.breakdown;
 
// The decimals of the token. In order for tokenMapping to be created,
// all instances must have the same number of decimals.
uBalance.decimals;

const bridgingOps = await encodeBridgingOps({
  tokenMapping: mUSDC,
  account: klaster.account,
  amount: uBalance.balance - parseUnits("1", uBalance.decimals), // Don't send entire balance
  bridgePlugin: liFiBrigePlugin,
  client: mcClient,
  destinationChainId: base.id,
  unifiedBalance: uBalance,
});

const sendERC20Op = rawTx({
  gasLimit: 100000n,
  to: destChainTokenAddress,
  data: encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [recipient, bridgingOps.totalReceivedOnDestination],
  }),
});

//step1: create interchain transaction
const iTx = buildItx({
  // BridgingOPs + Execution on the destination chain
  // added as steps to the iTx
  steps: bridgingOps.steps.concat(singleTx(destinationChainId, sendERC20Op)),
  // Klaster works with cross-chain gas abstraction. This instructs the Klaster
  // nodes to take USDC on Optimism as tx fee payment.
  feeTx: klaster.encodePaymentFee(optimism.id, "USDC"),
});

//step2: get quote, sign quote
const quote = await klaster.getQuote(iTx);
 
// The amount of USD that the node is willing to execute the iTx for
quote.tokenValue;

const signed = await signer.signMessage({
  message: {
    raw: quote.itxHash,
  },
  account: signerAccount,
});

//step3: execute
const result = await klaster.execute(quote, signed)

//fetch unified Balance
const uBalance = await mcClient.getUnifiedErc20Balance({
  tokenMapping: mUSDC,
  account: klaster.account,
});