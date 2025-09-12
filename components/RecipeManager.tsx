'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { RecipeForm } from '@/components/RecipeForm'
import IngredientManager from './IngredientManager'
import { useRecipes } from '@/hooks/useRecipes'
import { Recipe } from '@/types'

export function RecipeManager() {
  const { recipes, ingredients, isLoading, saveRecipe, deleteRecipe } = useRecipes()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const { toast } = useToast()

  const handleSave = async (recipe: Recipe) => {
    try {
      await saveRecipe(recipe)
      setIsAddingNew(false)
      setEditingRecipe(null)
      toast({
        title: "Success",
        description: `Recipe ${recipe.id ? 'updated' : 'saved'} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${recipe.id ? 'update' : 'save'} recipe. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setIsAddingNew(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id)
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading recipes...</div>
  }

  console.log('Recipes in RecipeManager:', recipes)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recipes</h2>
        <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Recipe
        </Button>
      </div>

      {isAddingNew && (
        <RecipeForm
          recipe={editingRecipe || { id: '', restaurantId: '', dishName: '', ingredients: [] }}
          onSave={handleSave}
          onCancel={() => {
            setIsAddingNew(false)
            setEditingRecipe(null)
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Dish</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.restaurantId}</TableCell>
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
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(recipe)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(recipe.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Manage Ingredients</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ingredient Manager</DialogTitle>
          </DialogHeader>
          <IngredientManager />
        </DialogContent>
      </Dialog>
    </div>
  )
}
