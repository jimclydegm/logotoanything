import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getOrders } from '@/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credits',
}

export default async function Credits() {
  let orders = await getOrders()

  // Calculate remaining credits (this is a placeholder - you would need to implement actual credit calculation)
  const totalCredits = 100; // Example total
  const usedCredits = orders.reduce((total, order) => total + parseInt(order.amount.usd.replace('$', '')), 0);
  const remainingCredits = totalCredits - usedCredits;

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Credits</Heading>
        <div className="text-lg font-medium">
          Remaining Credits: <span className="text-blue-600 dark:text-blue-400">{remainingCredits}</span>
        </div>
        <Button className="-my-0.5">Purchase Credits</Button>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Transaction ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} href={`/credits/${order.id}`} title={`Transaction #${order.id}`}>
              <TableCell>{order.id}</TableCell>
              <TableCell className="text-zinc-500">{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>
                {order.event.name}
              </TableCell>
              <TableCell className="text-right">US{order.amount.usd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
} 