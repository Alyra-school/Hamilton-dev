import { ethers } from "../frontend/node_modules/ethers/dist/ethers.js"
import { contractAddress, contractAbi } from "./constants.js";

const connectButton = document.getElementById('connectButton');
const balanceOfUser = document.getElementById('balanceOfUser');
const inputSendEthers = document.getElementById('inputSendEthers');
const buttonSendEthers = document.getElementById('buttonSendEthers');
const inputWithdrawEthers = document.getElementById('inputWithdrawEthers');
const buttonWithdrawEthers = document.getElementById('buttonWithdrawEthers');

let connectedAccount;

connectButton.addEventListener('click', async function() {
    if(typeof window.ethereum !== 'undefined') {
        const resultAccount = await window.ethereum.request({ method: "eth_requestAccounts" });
        connectedAccount = ethers.getAddress(resultAccount[0]);
        connectButton.innerHTML = "Connected with " + connectedAccount.substring(0,4) + "..." + connectedAccount.substring(connectedAccount.length - 4);
        await getBalanceOfUser();
    }
    else {
        connectButton.innerHTML = "Please install Metamask.";
    }
})

buttonSendEthers.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            let weiAmount = inputSendEthers.value;
            weiAmount = ethers.parseEther(weiAmount);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            let transaction = await contract.sendEthers({ value: weiAmount })
            await transaction.wait();
            inputSendEthers.value = '';
            await getBalanceOfUser();
        }
        catch(e) {
            console.log(e);
        }
    }
})

buttonWithdrawEthers.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            let weiAmount = inputWithdrawEthers.value;
            weiAmount = ethers.parseEther(weiAmount);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            let transaction = await contract.withdraw(weiAmount)
            await transaction.wait();
            inputWithdrawEthers.value = '';
            await getBalanceOfUser();
        }
        catch(e) {
            console.log(e);
        }
    }
})

async function getBalanceOfUser() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    let balance = await contract.getBalanceOfUser(connectedAccount);
    balanceOfUser.innerHTML = ethers.formatEther(balance) + " ETH";
}