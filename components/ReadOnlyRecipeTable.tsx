'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Recipe, Ingredient } from '@/types'

export default function ReadOnlyRecipeTable() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesResponse, ingredientsResponse] = await Promise.all([
          fetch('/api/recipes'),
          fetch('/api/ingredients')
        ])
        
        if (!recipesResponse.ok || !ingredientsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const recipesData = await recipesResponse.json()
        const ingredientsData = await ingredientsResponse.json()

        setRecipes(recipesData)
        setIngredients(ingredientsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch recipes and ingredients",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Restaurant</TableHead>
          <TableHead>Dish</TableHead>
          <TableHead>Ingredients</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell>{recipe.restaurant}</TableCell>
            <TableCell>{recipe.dishName}</TableCell>
            <TableCell>
              <ul className="list-disc list-inside">
                {recipe.ingredients.map((ingredient, index) => {
                  const ing = ingredients.find(i => i.id === ingredient.ingredientId)
                  return (
                    <li key={index} className="text-sm">
                      {ing?.name || 'Unknown ingredient'}: {ingredient.amount} {ing?.unit || 'units'}
                    </li>
                  )
                })}
              </ul>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
