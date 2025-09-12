import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataDirectory = path.join(process.cwd(), 'data')
const recipesPath = path.join(dataDirectory, 'recipes.json')

async function getRecipes() {
  try {
    await fs.mkdir(dataDirectory, { recursive: true })
    const data = await fs.readFile(recipesPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return an empty array
      return []
    }
    console.error('Error reading recipes:', error)
    throw error
  }
}

async function saveRecipes(recipes) {
  await fs.mkdir(dataDirectory, { recursive: true })
  await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2))
}

export async function GET() {
  try {
    const recipes = await getRecipes()
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error in GET:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const recipes = await getRecipes()
    const newRecipe = await req.json()
    newRecipe.id = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1
    recipes.push(newRecipe)
    await saveRecipes(recipes)
    return NextResponse.json(newRecipe)
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const recipes = await getRecipes()
    const updatedRecipe = await req.json()
    const index = recipes.findIndex(r => r.id === updatedRecipe.id)
    if (index !== -1) {
      recipes[index] = updatedRecipe
      await saveRecipes(recipes)
      return NextResponse.json(updatedRecipe)
    }
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  } catch (error) {
    console.error('Error in PUT:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = Number(searchParams.get('id'))
    const recipes = await getRecipes()
    const newRecipes = recipes.filter(r => r.id !== id)
    if (recipes.length !== newRecipes.length) {
      await saveRecipes(newRecipes)
      return NextResponse.json({ message: 'Recipe deleted' })
    }
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
