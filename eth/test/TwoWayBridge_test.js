const { expect } = require("chai");
const { ethers } = require("hardhat");
const assert = require("assert");

describe("TwoWayBridge", function () {
  let test_abi;
  let hashed_abi;
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
    token = await Token.connect(token_acc).deploy("wrappedTau", "wTAU");
    await token.deployed();
    const Bridge = await ethers.getContractFactory("ClearingHouse_1");
    bridge = await Bridge.connect(bridge_acc).deploy(token.address);
    await bridge.deployed();
    await token
      .connect(end_acc)
      .approve(bridge.address, ethers.BigNumber.from("0xD3C21BCECCEDA1000000"));
    await token
      .connect(token_acc)
      .grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        bridge.address
      );
  });

  it("Deploys the token and bridge contracts", async function () {
    assert.ok(token.address);
    assert.ok(bridge.address);
  });

  it("Withdraws minted tokens", async function () {
    const token_address = token.address;
    const amount = "0xde0b6b3a7640000";
    const nonce = "0x01";
    const end_address = end_acc.address;
    test_abi = ethers.utils.hexConcat(
      [token_address, amount, nonce, end_address].map((s) =>
        ethers.utils.hexZeroPad(s, 32)
      )
    );
    hashed_test_abi = ethers.utils.keccak256(test_abi.toLowerCase());
    signed_test_abi = await bridge_acc.signMessage(
      ethers.utils.arrayify(hashed_test_abi)
    );
    const split = ethers.utils.splitSignature(signed_test_abi);
    await bridge
      .connect(end_acc)
      .withdraw(
        token_address,
        ethers.BigNumber.from("0xde0b6b3a7640000"),
        1,
        split.v,
        split.r,
        split.s
      );
    expect(await token.balanceOf(end_acc.getAddress())).to.equal(
      "0xde0b6b3a7640000"
    );
  });

  it("Only allows the owner to call withdraw", async function () {
    const token_address = token.address;
    const amount = "0xde0b6b3a7640000";
    const nonce = "0x01";
    const end_address = end_acc.address;
    test_abi = ethers.utils.hexConcat(
      [token_address, amount, nonce, end_address].map((s) =>
        ethers.utils.hexZeroPad(s, 32)
      )
    );
    hashed_test_abi = ethers.utils.keccak256(test_abi.toLowerCase());
    signed_test_abi = await end_acc.signMessage(
      ethers.utils.arrayify(hashed_test_abi)
    );
    const split = ethers.utils.splitSignature(signed_test_abi);
    await expect(
      bridge
        .connect(end_acc)
        .withdraw(
          token_address,
          ethers.BigNumber.from("0xde0b6b3a7640000"),
          1,
          split.v,
          split.r,
          split.s
        )
    ).to.be.revertedWith("Invalid Signature!");
  });
  it("Requires the correct token address", async function () {
    const token_address = await end_acc.getAddress();
    const amount = "0xde0b6b3a7640000";
    const nonce = "0x01";
    const end_address = end_acc.address;
    test_abi = ethers.utils.hexConcat(
      [token_address, amount, nonce, end_address].map((s) =>
        ethers.utils.hexZeroPad(s, 32)
      )
    );
    hashed_test_abi = ethers.utils.keccak256(test_abi.toLowerCase());
    signed_test_abi = await bridge_acc.signMessage(
      ethers.utils.arrayify(hashed_test_abi)
    );
    const split = ethers.utils.splitSignature(signed_test_abi);
    await expect(
      bridge
        .connect(end_acc)
        .withdraw(
          token_address,
          ethers.BigNumber.from("0xde0b6b3a7640000"),
          1,
          split.v,
          split.r,
          split.s
        )
    ).to.be.revertedWith("Invalid token address!");
  });
  it("Emits a TokensBurned event", async function () {
    const token_address = token.address;
    const amount = "0xde0b6b3a7640000";
    const nonce = "0x01";
    const end_address = end_acc.address;
    test_abi = ethers.utils.hexConcat(
      [token_address, amount, nonce, end_address].map((s) =>
        ethers.utils.hexZeroPad(s, 32)
      )
    );
    hashed_test_abi = ethers.utils.keccak256(test_abi.toLowerCase());
    signed_test_abi = await bridge_acc.signMessage(
      ethers.utils.arrayify(hashed_test_abi)
    );
    const split = ethers.utils.splitSignature(signed_test_abi);
    await bridge
      .connect(end_acc)
      .withdraw(
        token_address,
        ethers.BigNumber.from("0xde0b6b3a7640000"),
        1,
        split.v,
        split.r,
        split.s
      );
    await expect(
      bridge
        .connect(end_acc)
        .deposit(
          1,
          "afbc94fbd23c8f6305b5d857f26709d6986f182985650a3c1549f9b885d7b1ff"
        )
    )
      .to.emit(bridge, "TokensBurned")
      .withArgs(
        1,
        "afbc94fbd23c8f6305b5d857f26709d6986f182985650a3c1549f9b885d7b1ff"
      );
  });
  it("Checks for used nonces", async function () {
    const token_address = token.address;
    const amount = "0xde0b6b3a7640000";
    const nonce = "0x01";
    const end_address = end_acc.address;
    test_abi = ethers.utils.hexConcat(
      [token_address, amount, nonce, end_address].map((s) =>
        ethers.utils.hexZeroPad(s, 32)
      )
    );
    hashed_test_abi = ethers.utils.keccak256(test_abi.toLowerCase());
    signed_test_abi = await bridge_acc.signMessage(
      ethers.utils.arrayify(hashed_test_abi)
    );
    const split = ethers.utils.splitSignature(signed_test_abi);
    await bridge
      .connect(end_acc)
      .withdraw(
        token_address,
        ethers.BigNumber.from("0xde0b6b3a7640000"),
        1,
        split.v,
        split.r,
        split.s
      );
    await expect(
      bridge
        .connect(end_acc)
        .withdraw(
          token_address,
          ethers.BigNumber.from("0xde0b6b3a7640000"),
          1,
          split.v,
          split.r,
          split.s
        )
    ).to.be.revertedWith("Nonce already used!");
  });
});
