import { NextRequest, NextResponse } from 'next/server'
import { calculateIngredientCosts } from '@/utils/calculateIngredientCosts'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { ordersPerDish, sellingPrices, commissions, recipes } = await req.json()

    const { ingredientDf, costDf } = calculateIngredientCosts(ordersPerDish, sellingPrices, commissions, recipes)

    const result = {
      ingredientData: ingredientDf,
      costData: costDf,
    }

    // Save the result to the database
    await prisma.costAnalysis.create({
      data: {
        data: JSON.stringify(result),
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating costs:', error)
    return NextResponse.json({ error: 'Error calculating costs' }, { status: 500 })
  }
}
