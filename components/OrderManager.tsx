'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { OrderForm } from './OrderForm'
import { OrderTable } from './OrderTable'
import { useOrders } from '@/hooks/useOrders'
import { useRecipes } from '@/hooks/useRecipes'
import { Order, Recipe, Restaurant } from '@/types'

export default function OrderManager() {
  const { toast } = useToast()
  const { orders, addOrder, updateOrder, deleteOrder, isLoading: isLoadingOrders } = useOrders()
  const { recipes, isLoading: isLoadingRecipes } = useRecipes()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants')
        if (!response.ok) throw new Error('Failed to fetch restaurants')
        const data = await response.json()
        setRestaurants(data)
        setIsLoadingRestaurants(false)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        toast({
          title: "Error",
          description: "Failed to fetch restaurants",
          variant: "destructive",
        })
        setIsLoadingRestaurants(false)
      }
    }

    fetchRestaurants()
  }, [toast])

  if (isLoadingOrders || isLoadingRecipes || isLoadingRestaurants) {
    return <div>Loading...</div>
  }

  const handleAddOrder = async (newOrder: Omit<Order, 'id' | 'timestamp'>) => {
    try {
      await addOrder(newOrder)
      toast({ title: 'Success', description: 'Order added successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add order', variant: 'destructive' })
    }
  }

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      await updateOrder(updatedOrder)
      toast({ title: 'Success', description: 'Order updated successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' })
    }
  }

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id)
      toast({ title: 'Success', description: 'Order deleted successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete order', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order Manager</h2>
      <OrderForm onSubmit={handleAddOrder} recipes={recipes} restaurants={restaurants} />
      <OrderTable
        orders={orders}
        recipes={recipes}
        restaurants={restaurants}
        onUpdate={handleUpdateOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  )
}
