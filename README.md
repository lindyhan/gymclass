students in a gym use this to vote for the next class. each student pays 10 USDC to vote. if the winning vote is what they had voted for, the 10 USDC serves as the class fee. if the winning vote is not what they had voted for, they get 2 USDC as a consolation, effectively paying a discounted rate for the class as it was not their first option.

Deploying contract GymVote.sol
``` 
npx hardhat run scripts/deploy.ts --network optimismSepolia      
```

Terminal output:
Deploying Gym Class contract to optimismSepolia...
Contract deployed to:
[0x23804876f3524e7e7dde209f610A07994b97465F](https://sepolia-optimism.etherscan.io/address/0x23804876f3524e7e7dde209f610A07994b97465F)

Casting vote:


https://github.com/user-attachments/assets/1f96f599-33bf-4bf9-9d02-98cac92127e9

![image](https://github.com/user-attachments/assets/75fb067a-c1cd-4614-8dfe-6fd70af7a99b)
![image](https://github.com/user-attachments/assets/9f2ee66b-60eb-4f8d-aef6-d3e8760d4900)
![image](https://github.com/user-attachments/assets/3119c43f-56c4-4a3c-801a-9247b746cdbb)




Querying results:
```
npx hardhat run scripts/queryResults.ts --network optimismSepolia
```

Terminal output:
Muay Thai: 0 votes
Kickboxing: 1 votes
Winner name: Kickboxing
