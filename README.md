##### problems addressed
(1) difficult to obtain a fair assessment of everyone in a community. more vocal members can swing decisions unfairly.\
(2) unnecessary time and effort for admin to chase membership fees.\
(3) dispute resoluion over voting transparenct and count.\
(4) identification of more valuable vs inactive members

##### solution
onchain voting where votes are batched with membership fee and publicly viewable

##### result
membership fee of all relevant members (those who are taking part in a certain activity) are collected together with their preferences (votes) by the contract. nobody has advantage by speaking louder or more, and nobody is excluded. onchain activity records show participation history as guide for future management plans and/or rewards

##### notes
- as most communities globally are still non web3 native, social media login options are available so they dont have to create a web3 wallet or even a new web2 login account. they can use their existing accounts with facebook/google/apple.
- a smart wallet abstracts away confusion about tokens and gas with management sponsoring gas
- can also integrate with fjat ramps to extract away the confusion of tokens entirely  users just pay with fiat and backend it is converted to USDC for vote casting
- easily scalable to any web2 community / group for decision making. examples: office pantry inventory, family gathering party theme, group vacation destination

---

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
