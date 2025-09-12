import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'orders.json')

async function getOrders() {
  try {
    const data = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataFile, '[]')
      return []
    }
    throw error
  }
}

async function saveOrders(orders: any[]) {
  await fs.writeFile(dataFile, JSON.stringify(orders, null, 2))
}

export async function GET() {
  try {
    const orders = await getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const order = await req.json()
    if (!order.restaurantId || !order.dishId || !order.amount || !order.date) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }
    const orders = await getOrders()
    const newOrder = { 
      ...order, 
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    orders.push(newOrder)
    await saveOrders(orders)
    return NextResponse.json(newOrder)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add order' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    const updatedOrder = await req.json()
    if (!updatedOrder.restaurantId || !updatedOrder.dishId || !updatedOrder.amount || !updatedOrder.date) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }
    const orders = await getOrders()
    const index = orders.findIndex((o: any) => o.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    orders[index] = {
      ...updatedOrder,
      id,
      timestamp: new Date().toISOString()
    }
    await saveOrders(orders)
    return NextResponse.json(orders[index])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    const orders = await getOrders()
    const filteredOrders = orders.filter((o: any) => o.id !== id)
    if (orders.length === filteredOrders.length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    await saveOrders(filteredOrders)
    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
