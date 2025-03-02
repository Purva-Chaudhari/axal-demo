// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@reclaimprotocol/verifier-solidity-sdk/contracts/Addresses.sol";
import "@reclaimprotocol/verifier-solidity-sdk/contracts/Reclaim.sol";
// import "@reclaimprotocol/verifier-solidity-sdk/contracts/Claims.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AxalDemo {
    address public owner;
    address public reclaimAddress;
    IERC20 public rewardToken;
    uint256 public rewardAmount = 10 * 1e18; // 10 AD20 Tokens per verification

    event ProofVerified(address indexed user, uint256 rewardAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor(address _tokenAddress) {
        rewardToken = IERC20(_tokenAddress);
        reclaimAddress = Addresses.ETHEREUM_SEPOLIA;
        owner = msg.sender;
    }

    function verifyProof(Reclaim.Proof memory proof) public {
        // Verify proof using Reclaim SDK
        Reclaim(reclaimAddress).verifyProof(proof);

        // string memory walletInContext = Claims.extractFieldFromContext(proof.claimInfo.context, '"Wallet":"');

        // require(
        //     keccak256(abi.encodePacked(walletInContext)) == keccak256(abi.encodePacked(msg.sender)),
        //     "Proof does not belong to sender"
        // );

        require(rewardToken.allowance(owner, address(this)) >= rewardAmount, "Not enough allowance");

        require(rewardToken.transferFrom(owner, msg.sender, rewardAmount), "Token transfer failed");

        emit ProofVerified(msg.sender, rewardAmount);
    }

    function setRewardAmount(uint256 _newAmount) external onlyOwner {
        rewardAmount = _newAmount;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(rewardToken.transfer(owner, amount), "Withdraw failed");
    }
}
