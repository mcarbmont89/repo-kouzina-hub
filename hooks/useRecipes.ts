"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export type Recipe = {
  id: string
  restaurantId: string
  dishName: string
  ingredients: {
    ingredientId: string
    amount: string
  }[]
}

export type Ingredient = {
  id: string
  name: string
  unit: string
  cost: string
  provider: string
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipes()
    fetchIngredients()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes")
      if (!response.ok) throw new Error("Failed to fetch recipes")
      const data = await response.json()
      console.log("Fetched recipes:", data) // Add this line for debugging
      setRecipes(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching recipes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch recipes",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients")
      if (!response.ok) throw new Error("Failed to fetch ingredients")
      const data = await response.json()
      setIngredients(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ingredients",
        variant: "destructive",
      })
    }
  }

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const response = await fetch("/api/recipes", {
        method: recipe.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      })

      if (!response.ok) throw new Error("Failed to save recipe")

      const savedRecipe = await response.json()
      await fetchRecipes()
      return savedRecipe
    } catch (error) {
      throw error
    }
  }

  const deleteRecipe = async (id: string) => {
    try {
      const response = await fetch(`/api/recipes?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete recipe")

      await fetchRecipes()
    } catch (error) {
      throw error
    }
  }

  return {
    recipes,
    ingredients,
    isLoading,
    saveRecipe,
    deleteRecipe,
  }
}
