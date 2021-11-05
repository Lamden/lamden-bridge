const { expect } = require("chai");
const { ethers } = require("hardhat");
const assert = require("assert");

describe("TwoWayBridge", function () {
  let test_abi =
    "0x0000000000000000000000004489E6467B15Ca881F51b80875b6Ab2b0e2Dcd3c0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000003C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const data = ethers.utils.toUtf8Bytes(test_abi);
  let token_acc;
  let bridge_acc;
  let end_acc;
  let mock_acc;
  let token;
  let bridge;
  let signed_test_abi;

  beforeEach(async () => {
    [token_acc, bridge_acc, end_acc, mock_acc] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ControlledToken");
    token = await Token.connect(token_acc).deploy();
    await token.deployed();
    const Bridge = await ethers.getContractFactory("ClearingHouse_1");
    bridge = await Bridge.connect(bridge_acc).deploy(token_acc.getAddress());
    await bridge.deployed();
  });
  it("Deploys the token and bridge contracts", async function () {
    assert.ok(token.address);
    assert.ok(bridge.address);
  });
  it("Withdraws minted tokens", async function () {
    signed_test_abi = await end_acc.signMessage(test_abi);
    const split = ethers.utils.splitSignature(signed_test_abi);
    // (split.v, split.r, split.s);
    console.log(signed_test_abi);
    assert.ok(true);
  });
  // it("Only allows the owner to call withdraw", async function () {
  //   signed_test_abi = await end_acc.signMessage(test_abi);
  //   singed_test_abi = slice
  // });
  // it("Requires the correct token address"),
  //   async function () {
  //     bridge.withdraw();
  //   };
  // it("Emits a TokensBurned event"),
  //   async function () {
  //     bridge.withdraw();
  //   };
});
