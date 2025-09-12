import { useState, useEffect } from 'react'
import { Order } from '@/types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data.map((order: any) => ({
        ...order,
        date: new Date(order.date),
        timestamp: new Date(order.timestamp).getTime()
      })))
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setIsLoading(false)
    }
  }

  const addOrder = async (newOrder: Omit<Order, 'id' | 'timestamp'>) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
    if (!response.ok) throw new Error('Failed to add order')
    const addedOrder = await response.json()
    setOrders([...orders, {
      ...addedOrder,
      date: new Date(addedOrder.date),
      timestamp: new Date(addedOrder.timestamp).getTime()
    }])
    return addedOrder
  }

  const updateOrder = async (updatedOrder: Order) => {
    const response = await fetch(`/api/orders/${updatedOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOrder),
    })
    if (!response.ok) throw new Error('Failed to update order')
    const updated = await response.json()
    setOrders(orders.map(order => order.id === updated.id ? {
      ...updated,
      date: new Date(updated.date),
      timestamp: new Date(updated.timestamp).getTime()
    } : order))
    return updated
  }

  const deleteOrder = async (id: string) => {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete order')
    setOrders(orders.filter(order => order.id !== id))
  }

  return { orders, isLoading, addOrder, updateOrder, deleteOrder }
}
