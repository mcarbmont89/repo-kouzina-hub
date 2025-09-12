import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ingredientsFile = path.join(process.cwd(), 'data', 'ingredients.json')
const recipesFile = path.join(process.cwd(), 'data', 'recipes.json')

async function getIngredients() {
  const data = await fs.readFile(ingredientsFile, 'utf8')
  return JSON.parse(data)
}

async function getRecipes() {
  const data = await fs.readFile(recipesFile, 'utf8')
  return JSON.parse(data)
}

export async function POST(req: NextRequest) {
  try {
    const { plannedRecipes } = await req.json()
    const [ingredients, recipes] = await Promise.all([getIngredients(), getRecipes()])

    const groupedIngredients: { [providerId: string]: { [restaurantId: string]: any } } = {}

    recipes.forEach((recipe: any) => {
      const plannedCount = plannedRecipes[recipe.id] || 0
      recipe.ingredients.forEach((recipeIngredient: any) => {
        const ingredient = ingredients.find((i: any) => i.id === recipeIngredient.ingredientId)
        if (ingredient) {
          const { id, name, unit, cost, provider } = ingredient
          const amount = parseFloat(recipeIngredient.amount) * plannedCount
          const totalCost = parseFloat(cost) * amount

          if (!groupedIngredients[provider]) {
            groupedIngredients[provider] = {}
          }
          if (!groupedIngredients[provider][recipe.restaurantId]) {
            groupedIngredients[provider][recipe.restaurantId] = {}
          }

          if (!groupedIngredients[provider][recipe.restaurantId][id]) {
            groupedIngredients[provider][recipe.restaurantId][id] = { id, name, unit, cost, totalAmount: 0, totalCost: 0 }
          }

          groupedIngredients[provider][recipe.restaurantId][id].totalAmount += amount
          groupedIngredients[provider][recipe.restaurantId][id].totalCost += totalCost
        }
      })
    })

    // Convert the nested object to an array of arrays
    const result = Object.entries(groupedIngredients).reduce((acc: any, [providerId, restaurantIngredients]) => {
      acc[providerId] = Object.entries(restaurantIngredients).reduce((restaurantAcc: any, [restaurantId, ingredients]) => {
        restaurantAcc[restaurantId] = Object.values(ingredients)
        return restaurantAcc
      }, {})
      return acc
    }, {})

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating shopping list:', error)
    return NextResponse.json({ error: 'Failed to generate shopping list' }, { status: 500 })
  }
}
