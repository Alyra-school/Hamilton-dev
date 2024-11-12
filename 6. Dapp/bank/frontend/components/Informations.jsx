import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"

const Informations = ({ hash, isConfirming, error, isConfirmed }) => {
  return (
    <>
        {hash && 
            <Alert className="bg-lime-400 text-black mb-2">
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    Transaction Hash: {hash}.
                </AlertDescription>
            </Alert>
        }
        {isConfirming && 
            <Alert className="bg-orange-400 text-black mb-2">
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    Waiting for confirmation...
                </AlertDescription>
            </Alert>
        }
        {error && (
            <Alert className="bg-red-600 text-white mb-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Error: {(error).shortMessage || error.message}
                </AlertDescription>
            </Alert>
        )}
        {isConfirmed && 
            <Alert className="bg-lime-400 text-black mb-2">
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    The transaction has been confirmed.
                </AlertDescription>
            </Alert>
        }
    </>
  )
}

export default Informations