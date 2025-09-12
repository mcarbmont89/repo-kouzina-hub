import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'restaurants.json')

async function getRestaurants() {
  try {
    const data = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveRestaurants(restaurants: any[]) {
  await fs.writeFile(dataFile, JSON.stringify(restaurants, null, 2))
}

export async function GET() {
  try {
    const restaurants = await getRestaurants()
    return NextResponse.json(restaurants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const newRestaurant = await req.json()
    if (!newRestaurant.name || newRestaurant.description.length > 200) {
      return NextResponse.json({ error: 'Invalid restaurant data' }, { status: 400 })
    }
    newRestaurant.id = Date.now().toString()
    const restaurants = await getRestaurants()
    restaurants.push(newRestaurant)
    await saveRestaurants(restaurants)
    return NextResponse.json(newRestaurant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add restaurant' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedRestaurant = await req.json()
    if (!updatedRestaurant.name || updatedRestaurant.description.length > 200) {
      return NextResponse.json({ error: 'Invalid restaurant data' }, { status: 400 })
    }
    const restaurants = await getRestaurants()
    const index = restaurants.findIndex((r: any) => r.id === updatedRestaurant.id)
    if (index !== -1) {
      restaurants[index] = updatedRestaurant
      await saveRestaurants(restaurants)
      return NextResponse.json(updatedRestaurant)
    }
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }
    let restaurants = await getRestaurants()
    restaurants = restaurants.filter((r: any) => r.id !== id)
    await saveRestaurants(restaurants)
    return NextResponse.json({ message: 'Restaurant deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 })
  }
}
