import { formatEther } from "viem"

const Balance = ({ isPending, balance }) => {
  return (
    <div className="mb-4">
        {isPending ? (
            <p>Loading...</p>
        ) : (
            <p>Your balance is : <span className="font-bold">{formatEther(balance.toString())} ETH</span></p>
        )}
    </div>
  )
}

export default Balance