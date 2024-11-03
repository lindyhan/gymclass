students in a gym use this to vote for the next class. each student pays 10 USDC to vote. if the winning vote is what they had voted for, the 10 USDC serves as the class fee. if the winning vote is not what they had voted for, they get 2 USDC as a consolation, effectively paying a discounted rate for the class as it was not their first option.

contract on sepolia:
[0x86127CAD6DBA4A303e676C647864DBB77883d5e5](https://sepolia.etherscan.io/address/0x86127cad6dba4a303e676c647864dbb77883d5e5)

contract on arbitrum sepolia: [0x923F2Ea903A7C0FAb500246Dc2ab51f177cb3B0f](https://sepolia.arbiscan.io/address/0x923f2ea903a7c0fab500246dc2ab51f177cb3b0f)

contract on optimism sepolia: [0x923F2Ea903A7C0FAb500246Dc2ab51f177cb3B0f](https://sepolia-optimism.etherscan.io/address/0x923f2ea903a7c0fab500246dc2ab51f177cb3b0f)

contract on base sepolia: [0x923F2Ea903A7C0FAb500246Dc2ab51f177cb3B0f](https://sepolia.basescan.org/address/0x923f2ea903a7c0fab500246dc2ab51f177cb3b0f) 


assigning voting rights:
```
npx hardhat give-rights --network Sepolia 0x123...
npx hardhat give-rights --network arbitrumSepolia 0x123...
npx hardhat give-rights --network optimismSepolia 0x123...
npx hardhat give-rights --network baseSepolia 0x123...
```
![image](https://github.com/user-attachments/assets/e1f68fb7-d12d-4b37-a156-374b9b17332a)

casting vote:
```
npx hardhat cast-vote --network Sepolia 0x123...
npx hardhat cast-vote --network arbitrumSepolia 0x123...
npx hardhat cast-vote --network optimismSepolia 0x123...
npx hardhat cast-vote --network baseSepolia 0x123...
```
