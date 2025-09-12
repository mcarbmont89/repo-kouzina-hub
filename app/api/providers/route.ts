import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'providers.json')

async function getProviders() {
  try {
    const data = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveProviders(providers: any[]) {
  await fs.writeFile(dataFile, JSON.stringify(providers, null, 2))
}

export async function GET() {
  try {
    const providers = await getProviders()
    return NextResponse.json(providers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const newProvider = await req.json()
    if (!newProvider.name || newProvider.description.length > 200) {
      return NextResponse.json({ error: 'Invalid provider data' }, { status: 400 })
    }
    newProvider.id = Date.now().toString()
    const providers = await getProviders()
    providers.push(newProvider)
    await saveProviders(providers)
    return NextResponse.json(newProvider)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add provider' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedProvider = await req.json()
    if (!updatedProvider.name || updatedProvider.description.length > 200) {
      return NextResponse.json({ error: 'Invalid provider data' }, { status: 400 })
    }
    const providers = await getProviders()
    const index = providers.findIndex((p: any) => p.id === updatedProvider.id)
    if (index !== -1) {
      providers[index] = updatedProvider
      await saveProviders(providers)
      return NextResponse.json(updatedProvider)
    }
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }
    let providers = await getProviders()
    providers = providers.filter((p: any) => p.id !== id)
    await saveProviders(providers)
    return NextResponse.json({ message: 'Provider deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}
