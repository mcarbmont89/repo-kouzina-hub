'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Ingredient, Provider, Recipe, Restaurant, AggregatedIngredient } from '@/types'

interface GroupedIngredients {
  [providerId: string]: {
    [restaurantId: string]: AggregatedIngredient[]
  }
}

export default function ShoppingList() {
  const [groupedIngredients, setGroupedIngredients] = useState<GroupedIngredients>({})
  const [providers, setProviders] = useState<Provider[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [plannedRecipes, setPlannedRecipes] = useState<{[recipeId: string]: number}>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [providersResponse, recipesResponse, restaurantsResponse] = await Promise.all([
        fetch('/api/providers'),
        fetch('/api/recipes'),
        fetch('/api/restaurants')
      ])

      if (!providersResponse.ok || !recipesResponse.ok || !restaurantsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const providersData: Provider[] = await providersResponse.json()
      const recipesData: Recipe[] = await recipesResponse.json()
      const restaurantsData: Restaurant[] = await restaurantsResponse.json()

      setProviders(providersData)
      setRecipes(recipesData)
      setRestaurants(restaurantsData)
      
      // Initialize plannedRecipes with 0 for each recipe
      const initialPlannedRecipes = recipesData.reduce((acc, recipe) => {
        acc[recipe.id] = 0
        return acc
      }, {} as {[recipeId: string]: number})
      setPlannedRecipes(initialPlannedRecipes)

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch initial data",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handlePlannedRecipeChange = (recipeId: string, count: number) => {
    setPlannedRecipes(prev => ({
      ...prev,
      [recipeId]: count
    }))
  }

  const calculateShoppingList = async () => {
    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plannedRecipes }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate shopping list')
      }

      const groupedIngredientsData: GroupedIngredients = await response.json()
      setGroupedIngredients(groupedIngredientsData)
    } catch (error) {
      console.error('Error calculating shopping list:', error)
      toast({
        title: "Error",
        description: "Failed to calculate shopping list",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading shopping list...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Planned Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{restaurant.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes
                  .filter((recipe) => recipe.restaurantId === restaurant.id)
                  .map((recipe) => (
                    <div key={recipe.id} className="flex items-center space-x-2">
                      <span className="flex-grow">{recipe.dishName}</span>
                      <Input
                        type="number"
                        min="0"
                        value={plannedRecipes[recipe.id]}
                        onChange={(e) => handlePlannedRecipeChange(recipe.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
          <Button onClick={calculateShoppingList} className="mt-4">Calculate Shopping List</Button>
        </CardContent>
      </Card>

      {Object.entries(groupedIngredients).map(([providerId, restaurantIngredients]) => {
        const provider = providers.find(p => p.id === providerId)
        const providerTotalCost = Object.values(restaurantIngredients).reduce(
          (sum, ingredients) => sum + ingredients.reduce((subSum, ing) => subSum + ing.totalCost, 0),
          0
        )

        return (
          <Card key={providerId}>
            <CardHeader>
              <CardTitle>{provider ? provider.name : 'Unknown Provider'}</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(restaurantIngredients).map(([restaurantId, ingredients]) => {
                const restaurant = restaurants.find(r => r.id === restaurantId)
                const restaurantTotalCost = ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)

                return (
                  <div key={restaurantId} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{restaurant ? restaurant.name : 'Unknown Restaurant'}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Cost (€)</TableHead>
                          <TableHead>Total Cost (€)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ingredients.map((ingredient) => (
                          <TableRow key={ingredient.id}>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>{ingredient.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>{ingredient.unit}</TableCell>
                            <TableCell>{parseFloat(ingredient.cost).toFixed(2)}</TableCell>
                            <TableCell>{ingredient.totalCost.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} className="font-bold text-right">Restaurant Total:</TableCell>
                          <TableCell className="font-bold">{restaurantTotalCost.toFixed(2)} €</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
              <div className="mt-4 text-right font-bold">
                Provider Total: {providerTotalCost.toFixed(2)} €
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
