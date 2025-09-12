import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

async function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

const dataFile = path.join(process.cwd(), 'data', 'recipes.json')

async function getRecipes() {
  await ensureDataDirectoryExists()
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

async function saveRecipes(recipes: any[]) {
  await ensureDataDirectoryExists()
  await fs.writeFile(dataFile, JSON.stringify(recipes, null, 2))
}

export async function GET() {
  try {
    const recipes = await getRecipes()
    console.log('Recipes from API:', recipes) // Add this line for debugging
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const newRecipe = await req.json()
    newRecipe.ingredients = newRecipe.ingredients.map((ing: any) => ({
      ...ing,
      amount: ing.amount.toString()
    }))

    // Validate recipe data
    if (!newRecipe.restaurantId || !newRecipe.dishName || !Array.isArray(newRecipe.ingredients)) {
      return NextResponse.json({ error: 'Invalid recipe data' }, { status: 400 })
    }

    // Validate each ingredient
    for (const ingredient of newRecipe.ingredients) {
      if (!ingredient.ingredientId || !ingredient.amount) {
        return NextResponse.json({ error: 'Invalid ingredient data' }, { status: 400 })
      }
    }

    // Generate a proper ID for the recipe
    newRecipe.id = Date.now().toString()
    
    const recipes = await getRecipes()
    recipes.push(newRecipe)
    await saveRecipes(recipes)
    return NextResponse.json(newRecipe)
  } catch (error) {
    console.error('Error adding recipe:', error)
    return NextResponse.json({ error: 'Failed to add recipe', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedRecipe = await req.json()
    updatedRecipe.ingredients = updatedRecipe.ingredients.map((ing: any) => ({
      ...ing,
      amount: ing.amount.toString()
    }))

    // Validate recipe data
    if (!updatedRecipe.id || !updatedRecipe.restaurantId || !updatedRecipe.dishName || !Array.isArray(updatedRecipe.ingredients)) {
      return NextResponse.json({ error: 'Invalid recipe data' }, { status: 400 })
    }

    // Validate each ingredient
    for (const ingredient of updatedRecipe.ingredients) {
      if (!ingredient.ingredientId || !ingredient.amount) {
        return NextResponse.json({ error: 'Invalid ingredient data' }, { status: 400 })
      }
    }

    const recipes = await getRecipes()
    const index = recipes.findIndex((r: any) => r.id === updatedRecipe.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    recipes[index] = updatedRecipe
    await saveRecipes(recipes)
    return NextResponse.json(updatedRecipe)
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json({ error: 'Failed to update recipe', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
    }
    
    let recipes = await getRecipes()
    recipes = recipes.filter((r: any) => r.id !== id)
    await saveRecipes(recipes)
    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
  }
}
