// @ts-check
const Web3 = require("web3");
const Lamden = require("lamden-js");

const abi = require("./abi/clearinghouse.json");
const abi2 = require("./abi/clearinghouse_1.json");
const conf = require("./conf.json");

const web3 = new Web3(conf.eth.network);
const ETH_CONTRACT_ADDRESS = conf.eth.contract_address;
const ETH_BRIDGE_ADDRESS = conf.eth.bridge_address;
const LAMDEN_CONTRACT_NAME = conf.lamden.contract;
const LAMDEN_BRIDGE_NAME = conf.lamden.bridge;
const LAMDEN_NETWORK_INFO = conf.lamden.network;

async function mintTokens(tokenAddress, receiver, amount) {
  const { vk, sk } = conf.lamden.wallet;
  const txInfo = {
    senderVk: vk,
    contractName: LAMDEN_CONTRACT_NAME,
    methodName: "mint",
    kwargs: {
      ethereum_contract: tokenAddress,
      amount: amount,
      lamden_wallet: receiver,
    },
    stampLimit: 100,
  };
  console.log("tx", txInfo);
  const tx = new Lamden.TransactionBuilder(LAMDEN_NETWORK_INFO, txInfo);
  const r = await tx.send(sk);
  console.log(r);
  return tx.checkForTransactionResult();
}

async function withdraw(amount, receiver) {
  const { vk, sk } = conf.lamden.b_wallet;
  const txInfo = {
    senderVk: vk,
    contractName: LAMDEN_BRIDGE_NAME,
    methodName: "withdraw",
    kwargs: {
      amount: amount,
      lamden_wallet: receiver,
    },
    stampLimit: 100,
  };
  console.log("tx", txInfo);
  const tx = new Lamden.TransactionBuilder(LAMDEN_NETWORK_INFO, txInfo);
  const r = await tx.send(sk);
  console.log(r);
  return tx.checkForTransactionResult();
}

async function ethEventListener() {
  console.log("Listening for wrapped EVM tokens at : ", ETH_CONTRACT_ADDRESS);
  console.log("Listening for burned Tau tokens at : ", ETH_BRIDGE_ADDRESS);
  const contract = new web3.eth.Contract(abi, ETH_CONTRACT_ADDRESS);
  const contractBridge = new web3.eth.Contract(abi2, ETH_BRIDGE_ADDRESS);
  contract.events
    .TokensWrapped()
    .on("data", async (event) => {
      console.log(event.returnValues);
      const { token, receiver, amount } = event.returnValues;
      const res = await mintTokens(
        token,
        receiver,
        "0x" + web3.utils.toBN(amount).toString("hex")
      );
      console.log(res);
    })
    .on("error", console.error);
  contractBridge.events
    .TokensBurned()
    .on("data", async (event) => {
      console.log(event.returnValues);
      const { amount, receiver } = event.returnValues;
      const res = await withdraw(
        "0x" + web3.utils.toBN(amount).toString("hex"),
        receiver
      );
      console.log(res);
    })
    .on("error", console.error);
}

ethEventListener();
