import { ethers } from "ethers.min.js"
import { contractAddress, contractAbi } from "./constants.js";

const connectButton = document.getElementById('connectButton');
const getNumber = document.getElementById('getNumber');
const theNumber = document.getElementById('theNumber');
const inputNumber = document.getElementById('inputNumber');
const setNumber = document.getElementById('setNumber');

let connectedAccount;

connectButton.addEventListener('click', async function() {
    if(typeof window.ethereum !== 'undefined') {
        const resultAccount = await window.ethereum.request({ method: "eth_requestAccounts" });
        connectedAccount = ethers.getAddress(resultAccount[0]);
        connectButton.innerHTML = "Connected with " + connectedAccount.substring(0,4) + "..." + connectedAccount.substring(connectedAccount.length - 4);
    }
    else {
        connectButton.innerHTML = "Please install Metamask.";
    }
})

getNumber.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractAbi, provider); // Provider = lire
            const number = await contract.getMyNumber();
            theNumber.innerHTML = number.toString();
        }
        catch(e) {
            console.log(e);
        }
    }
})

setNumber.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            const inputNumberByUser = inputNumber.value;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer); // Signer = Ecrire
            let transaction = await contract.setMyNumber(inputNumberByUser)
            await transaction.wait();
        }
        catch(e) {
            console.log(e);
        }
    }
})