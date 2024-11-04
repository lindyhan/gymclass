students in a gym use this to vote for the next class. each student pays 10 USDC to vote. if the winning vote is what they had voted for, the 10 USDC serves as the class fee. if the winning vote is not what they had voted for, they get 2 USDC as a consolation, effectively paying a discounted rate for the class as it was not their first option.

Deploying contract GymVote.sol
```
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat run scripts/deploy.ts --network arbitrumSepolia  
npx hardhat run scripts/deploy.ts --network optimismSepolia      
npx hardhat run scripts/deploy.ts --network baseSepolia    
```

Terminal output:
Deploying Gym Class contract to Sepolia...
Contract deployed to:
[0x78c052a3313965dc749f14763a35b2b5ef28c83e](https://sepolia.etherscan.io/address/0x78c052a3313965dc749f14763a35b2b5ef28c83e)

Deploying Gym Class contract to arbitrumSepolia...
Contract deployed to:
[0x23804876f3524e7e7dde209f610a07994b97465f](https://sepolia.arbiscan.io/address/0x23804876f3524e7e7dde209f610a07994b97465f)

Deploying Gym Class contract to optimismSepolia...
Contract deployed to:
[0xd6f07ab686db4b26840f39df2e80a7d4dba28eb4](https://sepolia-optimism.etherscan.io/address/0xd6f07ab686db4b26840f39df2e80a7d4dba28eb4)

Deploying Gym Class contract to baseSepolia...
Contract deployed to:
[0x036CbD53842c5426634e7929541eC2318f3dCF7e](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) 


Assigning voting rights:
```
npx hardhat give-rights --network Sepolia 0x123...
npx hardhat give-rights --network arbitrumSepolia 0x123...
npx hardhat give-rights --network optimismSepolia 0x123...
npx hardhat give-rights --network baseSepolia 0x123...
```

Terminal output:
Giving voting rights to 0x123...
Transaction hash: [0x...](https://sepolia.arbiscan.io/tx/0x7646e876a65fc636c0f02ce4f680876fd90bcf44b880577d7f62998df408bbe2)

Casting vote:
```
npx hardhat cast-vote --network Sepolia 0x123... 1 // or 0
npx hardhat cast-vote --network arbitrumSepolia 0x123... 0 // or 1
npx hardhat cast-vote --network optimismSepolia 0x123... 0 // or 1
npx hardhat cast-vote --network baseSepolia 0x123... 1 // or 0
```

Terminal output:
Voter Address: 0x123...
Voter Weight: 1
Has Voted: false
Resetting and approving USDC allowance...
USDC approved successfully.
Casting vote for proposal 1...
Vote cast successfully!
Transaction hash: [0x...](https://sepolia.arbiscan.io/tx/0xdc45aa9cc8001989f15cad57d5411dee481d4aeab58cca6d54613569b725f21c)

Querying results:
```
npx hardhat run scripts/queryResults.ts --network sepolia
npx hardhat run scripts/queryResults.ts --network arbitrumSepolia
npx hardhat run scripts/queryResults.ts --network optimismSepolia
npx hardhat run scripts/queryResults.ts --network baseSepolia
```

Terminal output:
Muay Thai: 0 votes
Kickboxing: 1 votes
Winner name: Kickboxing