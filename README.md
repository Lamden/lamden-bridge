# wrapped_tokens

Working repo for wrapped ERC20 -> Lamden token facilities

## General Workflow / Userflow

### Ethereum -> Lamden

1. User initiates a `deposit` on the Ethereum side. They supply the token and the amount to deposit.

- This calls `transferFrom` the caller and stores the token inside the Ethereum custodian.
- An Ethereum event is then emitted on the blockchain.

2. The Ethereum event is picked up by a web monitor. This web monitor has the operator keys for the Ethereum and Lamden smart contracts.

- The token address, token amount, and Lamden public key is parsed from the event.
- A transaction is issued on a Lamden contract that mints a new token associated with the ERC20 token deposited to the Lamden public key provided.

3. Workflow over.

### Lamden -> Ethereum

1. User initiates a `burn` transaction on the Lamden side. This transfers tokens from the user to the operator and destroys them.
2. The smart contract returns the Ethereum ABI that needs to be signed.
3. The operator listens for this response, and then signs the ABI with it's Ethereum signing key.
4. The operator then submits a transaction to the Lamden side which stores the signature on chain.
5. The user sees this signature on chain, takes it, and uses it as the arguments for the Ethereum `withdraw` function.

- The withdraw function unpacks the arguments and validates the sender is correct and the nonce is correct.
- It also cryptographically validates that the operator signed the payload and not someone else.
- If this is correct, the amount of tokens in the signature is issued to the sender.

### Adding support for tokens

1. A user deploys a wrapped version of a token on Lamden. It must adhere to the smart contract specifications.
2. The user calls `add_token` on the Lamden `router.py` contract with the corresponding arguments. This then creates a logical link between an Ethereum address that is emitted on the blockchain and a Lamden smart contract that conforms to the standard provided.

- They provide the name of the contract they made. It is checked for adherence to the protocol.
- Right now, the contract expects the operator to be the only one adding tokens. This is because there is no way to manage if people sabotage tokens with bad smart contracts somehow.
- Assuming everything is good, the link is made. The address has to be whitelabeled on the Ethereum side by calling the correct function.

### Workflow for Tau transfers

1. User calls the `deposit` function on the `lamden_bridge` smart contract. The Tau tokens are transferred from the user to the `lamden_bridge`. The `lamden_bridge` then issues a proof. That proof is signed by the LamdenLink services and posted to the Lamden blockchain.
2. The user then takes that proof and submits it to the Ethereum blockchain. This is done automatically by LamdenLink. If the proof is successful, then it mints those tokens on the Ethereum / EVM chain. Success!
3. If a user wants to go back, they `deposit` the tokens on the Ethereum `TwoWayBridge.sol` contract. The tokens are then burned and an event is issued. This event is picked up by LamdenLink and the Tau is sent from its balance to the user.

### Unit testing

**Lamden contract**

Run `python3 lamden_bridge_test.py` inside the test's directory. The error logs above test results are expected, as the tests check for assertions throwing the correct errors.

**Ethereum contract**

Run `npx hardhat test` inside `./eth`.

### Reproducing the end to end test for Tau tokens

Note: Deployment of contracts may be skipped, and contracts interacted with at addresses already deployed and listed in the config files.

1. **Deploying to Ethereum**

Begin by setting up the ethereum contracts. These are deployed using hardhat from the `./eth` directory. Install hardhat by running `npm install --save-dev hardhat`. Configure `hardhat.config.js` to have the correct solidity version, correct network urls and correct private keys to the accounts that will be deploying the contracts. For the two contracts `ControlledToken` and `ClearingHouse_1` within `TwoWayBridge.sol` we will be using neworks labeled `rinkeby1` and `rinkeby2`. These are actually the same network but contain different accounts for the two contracts. After infura links and account keys are configured, deploy the token contract by running `npx hardhat run scripts/deploy_token.js --network rinkeby2`. This should return the address of the token contract, which you should copy and pass as constructor argument to `Token.deploy()` within `./scripts/deploy_bridge.js`. Afterwards deploy bridge contract using `npx hardhat run scripts/deploy_bridge.js --network rinkeby1`. Save the bridge's address.

2. **Deploying to Lamden**

Deploying contracts on the lamden side: simply deploy `lamden_bridge.py` contract inside the Lamden wallet app, and pass the token's eth address, copied in the last step, as a constructor argument.

3. **Configuring listening servers**

Configure the listeners by editing `conf.json` within `./server`. Change the value of `bridge` to the name you used when deploying `lamden_bridge.py` to Lamden, make sure to also add the vk and sk corresponding to the account that deployed it. Afterwards enter the private key corresponding to the `ClearingHouse_1` contract on ether and the address of the contract, as well as the network url which was used in deploying to ethereum.

4. **Running listening servers**

CD into `./server` and run `npm install` followed by `node lamden.js`. Open a new terminal window and run `node eth.js` within `./server`. The listeners are now running.

5. **Contract interaction**

Use an account on both blockchains that isn't an owner of any of the contracts. Remember to approve the bridge contracts on both sides. Follow the workflow by calling `deposit` first on the Lamden side, then submitting the signature's v,r,s as well as deposit arguments into `withdraw` on the Ethereum side. To return your dTau to Lamden call `deposit` on the Ethereum contract and see the Tau appear in your Lamden wallet. The listening servers should print into the console when they catch events and send corresponding transactions.

I interacted with the contracts on the Lamden side with the wallet and using Remix on the Ethereum side.
