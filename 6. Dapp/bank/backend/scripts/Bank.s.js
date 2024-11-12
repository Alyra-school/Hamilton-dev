const hre = require("hardhat");

async function main() {

  const Bank = await hre.ethers.deployContract("Bank");

  await Bank.waitForDeployment();

  console.log(
    `Bank deployed to ${Bank.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});