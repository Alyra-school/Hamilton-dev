import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import { formatEther } from "viem"

const Events = ({ events }) => {
  return (
    <>
      <h2 className="text-4xl font-extrabold mt-4">Events</h2>
      <Table className="mt-4">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={crypto.randomUUID()}>
              <TableCell className="font-medium">
                {event.type === 'Deposit' ? (
                  <Badge className="bg-lime-400">Deposit</Badge>
                ) : (
                  <Badge className="bg-red-400">Withdraw</Badge>
                )}
              </TableCell>
              <TableCell>{event.address}</TableCell>
              <TableCell className="text-right">{formatEther((event.amount).toString())} ETH</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default Events