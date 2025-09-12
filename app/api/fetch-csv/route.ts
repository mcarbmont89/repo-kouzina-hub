import { NextRequest, NextResponse } from 'next/server'

async function fetchCSV(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV from ${url}`)
  }
  return response.text()
}

function parseCSV(csv: string) {
  const lines = csv.split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim()
      return obj
    }, {} as Record<string, string>)
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')

  const urls = {
    orders: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Orders_CSV-OIylJcPsb23IG4NfBEWOgAKCTCwMYT.csv',
    recipes: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Recipes_CSV-39yUnd7eI2bz3355PGOYcZ0gjMPsYK.csv',
    ingredients: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ingredients_CSV-8oBeB5nMGTby059ha6mrUmhyRP2OIJ.csv'
  }

  if (!type || !(type in urls)) {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  }

  try {
    const csvData = await fetchCSV(urls[type as keyof typeof urls])
    const parsedData = parseCSV(csvData)
    return NextResponse.json(parsedData)
  } catch (error) {
    console.error(`Error fetching ${type} CSV:`, error)
    return NextResponse.json({ error: `Failed to fetch ${type} data` }, { status: 500 })
  }
}
