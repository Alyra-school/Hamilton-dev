import Balance from "./Balance"
import Deposit from "./Deposit"
import Withdraw from "./Withdraw"
import Events from "./Events"

import { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"

import { publicClient } from "@/utils/client"

import { parseAbiItem } from "viem"

const Bank = () => {

  const { address } = useAccount()
  const [events, setEvents] = useState([])

  const getEvents = async() => {
    const depositEvents = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem('event etherDeposited(address indexed account, uint amount)'),
      fromBlock: 6141973n,
      toBlock: 'latest'
    })

    const withdrawEvents = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem('event etherWithdrawed(address indexed account, uint amount)'),
      fromBlock: 6141973n,
      toBlock: 'latest'
    })

    const combinedEvents = depositEvents.map((event) => ({
      type: 'Deposit',
      address: event.args.account,
      amount: event.args.amount,
      blockNumber: Number(event.blockNumber)
    })).concat(withdrawEvents.map((event) => ({
      type: 'Withdraw',
      address: event.args.account,
      amount: event.args.amount,
      blockNumber: Number(event.blockNumber)
    })))

    combinedEvents.sort(function(a,b) {
      return b.blockNumber - a.blockNumber
    })

    setEvents(combinedEvents);
  }

  useEffect(() => {
    const getAllEvents = async() => {
      if(address !== 'undefined') {
        await getEvents();
      }
    }
    getAllEvents();
  }, [address])

  const { data: balanceOfConnectedAddress, error, isPending, refetch } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: 'getBalanceOfUser',
    account: address
  })

  return (
    <>
      <Balance isPending={isPending} balance={balanceOfConnectedAddress} />
      <Deposit refetch={refetch} getEvents={getEvents} />
      <Withdraw refetch={refetch} getEvents={getEvents} />
      <Events events={events} />
    </>
  )
}

export default Bank