export const contractAddress="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const contractAbi=[
    {
      "inputs": [],
      "name": "Bank__NotEnoughEthersOnTheSC",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Bank__NotEnoughFundsProvided",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Bank__WithdrawFailed",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getBalanceOfUser",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sendEthers",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
]