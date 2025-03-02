require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: '0.8.20',
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/UoaLI0IjAbwMwjxZIuvu0rM0v583psAP`,
      accounts: [
        '0x1f2f3f4f5f6f7f8f9f0f1f2f3f4f5f6f7f8f9f0f1f2f3f4f5f6f7f8f9f0f1',
      ],
    },
  },
};
