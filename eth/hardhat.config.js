require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const RINKEBY_PRIVATE_KEY1 =
  "2cc1c54f39e018e99f177e41dba2dc4981caf9f5dd804ebd6263c9217530b77d";
const RINKEBY_PRIVATE_KEY2 =
  "191bc1222fc00d33553bc658d49e8d322f4f43c8688d6e9db8c7f1ab680d31fd";
module.exports = {
  solidity: "0.8.3",
  networks: {
    rinkeby1: {
      url: `https://rinkeby.infura.io/v3/a3f4e2530c1e4f558a7102056bb2bd87`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY1}`],
    },
    rinkeby2: {
      url: `https://rinkeby.infura.io/v3/a3f4e2530c1e4f558a7102056bb2bd87`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY2}`],
    },
  },
};
