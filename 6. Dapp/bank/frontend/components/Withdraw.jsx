'use client';
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'

import { contractAddress, contractAbi } from "@/constants";

import { parseEther } from "viem";

import Informations from "./Informations";

const Withdraw = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const [withdrawValue, setWithdrawValue] = useState('');

    const { data: hash, isPending, error, writeContract } = useWriteContract()

    const withdraw = async() => {
        if(!isNaN(withdrawValue)) {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'withdraw',
                args: [parseEther(withdrawValue)],
                account: address
            }) 
        }
        else {
            console.log('Please put a number')
        }
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    useEffect(() => {
        if(isConfirmed) {
            refetch()
            setWithdrawValue('');
            getEvents();
        }
    }, [isConfirmed])

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4 mt-4">Withdraw</h2>
            <Informations hash={hash} isConfirming={isConfirming} error={error} isConfirmed={isConfirmed} />
            <div className="flex items-center">
                <Input placeholder='Amount in ETH' onChange={(e) => setWithdrawValue(e.target.value)} value={withdrawValue} />
                <Button onClick={withdraw} className="hover:bg-gray-600 bg-gray-700 text-white">Withdraw</Button>
            </div>
        </>
    )
}

export default Withdraw