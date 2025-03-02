// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const ad20 = await hre.ethers.deployContract('AD20', [], {});

  await ad20.waitForDeployment();

  console.log(`Ad20 with deployed to ${ad20.target}`);

  const AxalDemo = await hre.ethers.deployContract('AxalDemo', [ad20.target]);

  await AxalDemo.waitForDeployment();

  console.log(`AxalDemo with deployed to ${AxalDemo.target}`);

  await ad20
    .connect(deployer)
    .approve(AxalDemo.target, hre.ethers.parseEther('10000'));
  console.log(`✅ Approved 1000 AD20 for AxalDemo contract`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
