const {
  time,
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { expect } = require('chai');

const { ethers } = require('hardhat');

describe('AxalDemo', function () {
  async function deployAxalDemoFixture() {
    const [owner, user, otherAccount] = await ethers.getSigners();

    // Deploy Claims Library First
    // const Claims = await ethers.getContractFactory("@reclaimprotocol/verifier-solidity-sdk/contracts/Claims.sol:Claims");
    // const claims = await Claims.deploy();
    // await claims.waitForDeployment();
    // console.log("✅ Claims Library deployed at:", claims.target);

    // Deploy ERC-20 Token (AD20)
    const AD20 = await ethers.getContractFactory('AD20');
    const ad20 = await AD20.deploy();
    await ad20.waitForDeployment();

    // Deploy AxalDemo Contract
    const AxalDemo = await ethers.getContractFactory('AxalDemo');
    const reclaimMockAddress = owner.address; // Mocked for testing
    const axalDemo = await AxalDemo.deploy(ad20.target, reclaimMockAddress);
    await axalDemo.waitForDeployment();

    // Mint tokens to owner and approve AxalDemo
    const rewardAmount = ethers.parseEther('10');
    await ad20.approve(axalDemo.target, ethers.parseEther('1000'));

    return { axalDemo, ad20, owner, user, otherAccount, rewardAmount };
  }

  describe('Deployment', function () {
    it('Should deploy with correct token and reclaim address', async function () {
      const { axalDemo, ad20, owner } = await deployAxalDemoFixture();

      expect(await axalDemo.rewardToken()).to.equal(ad20.target);
      expect(await axalDemo.owner()).to.equal(owner.address);
    });
  });

  describe('Proof Verification', function () {
    it('Should verify proof and transfer rewards', async function () {
      const { axalDemo, ad20, user, rewardAmount } =
        await deployAxalDemoFixture();

      // Mock Proof (Normally this comes from Reclaim)
      const proof = { claimInfo: { context: `Wallet: ${user.address}` } };

      // Check balance before verification
      const initialBalance = await ad20.balanceOf(user.address);

      // User calls verifyProof
      await expect(axalDemo.connect(user).verifyProof(proof))
        .to.emit(axalDemo, 'ProofVerified')
        .withArgs(user.address, rewardAmount);

      // Check balance after verification
      const finalBalance = await ad20.balanceOf(user.address);
      expect(finalBalance).to.equal(initialBalance + rewardAmount);
    });

    it("Should fail if proof wallet doesn't match msg.sender", async function () {
      const { axalDemo, otherAccount } = await deployAxalDemoFixture();

      const proof = {
        claimInfo: {
          context: `Wallet: 0x0000000000000000000000000000000000000000`,
        },
      };

      await expect(
        axalDemo.connect(otherAccount).verifyProof(proof)
      ).to.be.revertedWith('Proof does not belong to sender');
    });

    it('Should fail if allowance is insufficient', async function () {
      const { axalDemo, ad20, user, rewardAmount } =
        await deployAxalDemoFixture();

      // Reduce allowance below required reward amount
      await ad20.approve(axalDemo.target, 0);

      const proof = { claimInfo: { context: `Wallet: ${user.address}` } };

      await expect(
        axalDemo.connect(user).verifyProof(proof)
      ).to.be.revertedWith('Not enough allowance');
    });
  });

  describe('Admin Functions', function () {
    it('Should allow owner to set reward amount', async function () {
      const { axalDemo, owner } = await deployAxalDemoFixture();
      const newReward = ethers.parseEther('20');

      await axalDemo.connect(owner).setRewardAmount(newReward);
      expect(await axalDemo.rewardAmount()).to.equal(newReward);
    });

    it('Should allow owner to withdraw tokens', async function () {
      const { axalDemo, ad20, owner } = await deployAxalDemoFixture();
      const withdrawAmount = ethers.parseEther('50');

      await expect(axalDemo.connect(owner).withdrawTokens(withdrawAmount))
        .to.emit(axalDemo, 'Withdrawal')
        .withArgs(owner.address, withdrawAmount);

      expect(await ad20.balanceOf(owner.address)).to.be.greaterThan(
        withdrawAmount
      );
    });

    it('Should reject non-owner from setting reward amount', async function () {
      const { axalDemo, otherAccount } = await deployAxalDemoFixture();
      const newReward = ethers.parseEther('20');

      await expect(
        axalDemo.connect(otherAccount).setRewardAmount(newReward)
      ).to.be.revertedWith('Only owner can call this');
    });
  });
});
