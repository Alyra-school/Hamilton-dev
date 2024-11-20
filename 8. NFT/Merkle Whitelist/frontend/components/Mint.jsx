import { useAccount } from "wagmi"
import { useState, useEffect } from "react";
import { whitelisted } from "@/utils/whitelisted";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/utils/constants";

const Mint = () => {

    const { address } = useAccount();
    const [merkleProof, setMerkleProof] = useState([]);
    const [merkleRootError, setMerkleRootError] = useState('');

    const { data: hash, error: mintError, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                // Toaster
            },
            onError: (error) => {
                console.log(error.message);
            }
        }
    })

    const mint = async() => {
        writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'safeMint',
            account: address,
            args: [address, merkleProof]
        })
    }

    const { isLoading, isSuccess } = useWaitForTransactionReceipt({
        hash
    });

    useEffect(() => {
        console.log(merkleRootError);
    }, [merkleRootError])

    useEffect(() => {
        if(address) {
            try {
                const tree = StandardMerkleTree.of(whitelisted, ["address"], { sortLeaves: true });
                const proof = tree.getProof([address]);
                setMerkleProof(proof);
            }
            catch {
                setMerkleRootError('You are not eligible to mint your NFT.');
            } 
        }
    }, [])

    return (
        <div className="p-5">
            {hash && (
                <div>
                    Hash : {hash}
                </div>
            )}
            {isLoading && (
                <div>
                    Waiting for confirmation...
                </div>
            )} 
            {isSuccess && (
                <div>
                    Check your wallet, you have received 1 NFT!
                </div>
            )} 
            Please click on the button below to Mint your NFT. (Only 1 NFT per address)
            <button onClick={mint}>
                Mint your NFT
            </button>
        </div>
    )
}

export default Mint