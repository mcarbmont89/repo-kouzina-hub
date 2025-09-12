import { NextResponse } from 'next/server'

// This is mock data. In a real application, you would fetch this from a database.
const mockReports = [
  {
    id: '1',
    date: '2023-07-01',
    totalRevenue: 5000,
    totalCost: 3000,
    profit: 2000
  },
  {
    id: '2',
    date: '2023-07-02',
    totalRevenue: 5500,
    totalCost: 3200,
    profit: 2300
  },
  {
    id: '3',
    date: '2023-07-03',
    totalRevenue: 4800,
    totalCost: 2900,
    profit: 1900
  }
]

export async function GET() {
  try {
    // In a real application, you would fetch reports from a database here
    return NextResponse.json(mockReports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 })
  }
}
