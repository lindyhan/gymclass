this is a voting tool for the theme of this year's christmas party - 
White Christmas or Green Christmas

clone the repository into your local environment
```shell
git clone git@github.com:lindyhan/letsvote.git
```
create a .env file in the root directory and fill in the values for your wallet's private key and your alchemy API key
```shell
PRIVATE_KEY=
ALCHEMY_API_KEY=
CONTRACT_ADDRESS=
```
you will get the value for the contract address after you deploy the contract.

run
```shell
npm install hardhat dotenv
npx hardhat compile
```
you should see 
Compiled 1 Solidity file successfully 

run
```shell
npx ts-node scripts/deploy.ts
```
update your .env file with the contract address of the deployed contract

(1) to assign rights
```shell
npx hardhat give-rights --network sepolia 0x123...
```

(2) to cast vote (0 for white christmas, 1 for green christmas)
```shell
voting % npx hardhat cast-vote --network sepolia 0
```
(3) to delegate voting rights
```shell
npx hardhat delegate --network sepolia 0x123...
```

 (4) to query voting results
```shell
npx hardhat run scripts/queryResults.ts --network sepolia
```

You will see something like this
![git](https://github.com/user-attachments/assets/c46bf2a7-6e12-46e1-9205-65b7a7478041)
