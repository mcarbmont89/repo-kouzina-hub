import { type NextRequest, NextResponse } from "next/server"
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getIngredientsWithProviders,
} from "@/lib/dataService"
import { validateIngredient } from "@/lib/validation"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const withProviders = url.searchParams.get("withProviders") === "true"

    if (id) {
      const ingredient = await getIngredientById(id)
      if (!ingredient) {
        return NextResponse.json({ error: "Ingredient not found" }, { status: 404 })
      }
      return NextResponse.json(ingredient)
    }

    if (withProviders) {
      const ingredients = await getIngredientsWithProviders()
      return NextResponse.json(ingredients)
    }

    const ingredients = await getAllIngredients()
    return NextResponse.json(ingredients)
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate ingredient data
    const validation = validateIngredient(data)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const newIngredient = await createIngredient(validation.data!)
    return NextResponse.json(newIngredient)
  } catch (error) {
    console.error("Error adding ingredient:", error)
    return NextResponse.json({ error: "Failed to add ingredient" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()

    if (!data.id) {
      return NextResponse.json({ error: "Ingredient ID is required" }, { status: 400 })
    }

    // Validate ingredient data
    const validation = validateIngredient(data)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const updatedIngredient = await updateIngredient(data.id, validation.data!)

    if (!updatedIngredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 })
    }

    return NextResponse.json(updatedIngredient)
  } catch (error) {
    console.error("Error updating ingredient:", error)
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Ingredient ID is required" }, { status: 400 })
    }

    const success = await deleteIngredient(id)

    if (!success) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ingredient deleted successfully" })
  } catch (error) {
    console.error("Error deleting ingredient:", error)
    return NextResponse.json({ error: "Failed to delete ingredient" }, { status: 500 })
  }
}
