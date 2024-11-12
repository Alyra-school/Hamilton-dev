'use client';
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'

import { contractAddress, contractAbi } from "@/constants";

import { parseEther } from "viem";

import Informations from "./Informations";

const Deposit = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const { toast } = useToast()
    const [depositValue, setDepositValue] = useState('');

    const { data: hash, isPending, error, writeContract } = useWriteContract()

    const deposit = async() => {
        if(!isNaN(depositValue)) {
            writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'deposit',
                value: parseEther(depositValue),
                account: address
            }) 
        }
        else {
            toast({
                title: "Error",
                description: "Please put a number.",
                className: 'bg-red-600'
            })
        }
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    useEffect(() => {
        if(isConfirmed) {
            refetch()
            setDepositValue('');
            getEvents();
        }
    }, [isConfirmed])

    return (
        <>
            <h2 className="text-4xl font-extrabold mb-4">Deposit</h2>
            <Informations hash={hash} isConfirming={isConfirming} error={error} isConfirmed={isConfirmed} />
            <div className="flex items-center">
                <Input placeholder='Amount in ETH' onChange={(e) => setDepositValue(e.target.value)} value={depositValue} />
                <Button onClick={deposit} className="hover:bg-gray-600 bg-gray-700 text-white">Deposit</Button>
            </div>
        </>
    )
}

export default Deposit