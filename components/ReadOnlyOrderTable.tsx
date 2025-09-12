'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Order {
  id: string
  dishId: string
  amount: number
  date: string
  timestamp: number
}

interface Recipe {
  id: string
  dishName: string
}

export default function ReadOnlyOrderTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, recipesResponse] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/recipes')
        ])
        
        if (!ordersResponse.ok || !recipesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const ordersData = await ordersResponse.json()
        const recipesData = await recipesResponse.json()

        setOrders(ordersData)
        setRecipes(recipesData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch orders and recipes",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dish</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              {recipes.find(recipe => recipe.id === order.dishId)?.dishName || 'Unknown Dish'}
            </TableCell>
            <TableCell>{order.amount.toFixed(2)}</TableCell>
            <TableCell>{format(new Date(order.date), "PPP")}</TableCell>
            <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
