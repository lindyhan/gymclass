students in a gym use this to vote for the next class. each student pays 10 USDC to vote. if the winning vote is what they had voted for, the 10 USDC serves as the class fee. if the winning vote is not what they had voted for, they get 2 USDC as a consolation, effectively paying a discounted rate for the class as it was not their first option.

Deploying contract GymVote.sol
``` 
npx hardhat run scripts/deploy.ts --network optimismSepolia      
```

Terminal output:
Deploying Gym Class contract to optimismSepolia...
Contract deployed to:
[0xd6f07ab686db4b26840f39df2e80a7d4dba28eb4](https://sepolia-optimism.etherscan.io/address/0xd6f07ab686db4b26840f39df2e80a7d4dba28eb4)

Casting vote:

Querying results:
```
npx hardhat run scripts/queryResults.ts --network optimismSepolia
```

Terminal output:
Muay Thai: 0 votes
Kickboxing: 1 votes
Winner name: Kickboxing