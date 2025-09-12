"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Recipe, Ingredient, Restaurant } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface RecipeIngredient {
  ingredient_id: string
  quantity: number
  notes?: string
}

interface RecipeFormProps {
  recipe?: Partial<Recipe & { ingredients: RecipeIngredient[] }>
  onSave: (recipe: Recipe & { ingredients: RecipeIngredient[] }) => void
  onCancel: () => void
}

const defaultRecipe: Recipe & { ingredients: RecipeIngredient[] } = {
  id: "",
  restaurant_id: "",
  name: "",
  description: "",
  category: "",
  preparation_time_minutes: 0,
  cooking_time_minutes: 0,
  serving_size: 1,
  is_active: true,
  ingredients: [],
}

export function RecipeForm({ recipe = defaultRecipe, onSave, onCancel }: RecipeFormProps) {
  const [formData, setFormData] = useState<Recipe & { ingredients: RecipeIngredient[] }>({
    ...defaultRecipe,
    ...recipe,
    ingredients: (recipe.ingredients || []).map((ing) => ({
      ...ing,
    })),
  })
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchIngredients()
    fetchRestaurants()
  }, [])

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

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants")
      if (!response.ok) throw new Error("Failed to fetch restaurants")
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch restaurants",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: keyof (Recipe & { ingredients: RecipeIngredient[] }), value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient_id: "", quantity: 0 }],
    }))
  }

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.restaurant_id) {
        throw new Error("Please select a restaurant")
      }

      if (!formData.ingredients.length) {
        throw new Error("At least one ingredient is required")
      }

      for (const ingredient of formData.ingredients) {
        if (!ingredient.ingredient_id || !ingredient.quantity) {
          throw new Error("All ingredients must have both an ingredient and amount")
        }
      }

      await onSave(formData)
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save recipe",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formData.id ? "Edit Recipe" : "Add New Recipe"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Restaurant</label>
              <Select
                value={formData.restaurant_id}
                onValueChange={(value) => handleInputChange("restaurant_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Recipe Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Recipe name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={formData.category || ""}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Category (e.g., Main Course, Dessert)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Serving Size</label>
              <Input
                type="number"
                min="1"
                value={formData.serving_size || ""}
                onChange={(e) => handleInputChange("serving_size", Number.parseInt(e.target.value) || 1)}
                placeholder="Number of servings"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preparation Time (minutes)</label>
              <Input
                type="number"
                min="0"
                value={formData.preparation_time_minutes || ""}
                onChange={(e) => handleInputChange("preparation_time_minutes", Number.parseInt(e.target.value) || 0)}
                placeholder="Prep time in minutes"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cooking Time (minutes)</label>
              <Input
                type="number"
                min="0"
                value={formData.cooking_time_minutes || ""}
                onChange={(e) => handleInputChange("cooking_time_minutes", Number.parseInt(e.target.value) || 0)}
                placeholder="Cooking time in minutes"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Recipe description"
                rows={3}
              />
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked === true)}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Ingredients</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            <ScrollArea className="h-[300px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.ingredients.map((ingredient, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={ingredient.ingredient_id}
                          onValueChange={(value) => handleIngredientChange(index, "ingredient_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient">
                              {ingredients.find((i) => i.id === ingredient.ingredient_id)?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ingredients.map((ing) => (
                              <SelectItem key={ing.id} value={ing.id}>
                                {ing.name} ({ing.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={ingredient.quantity}
                          onChange={(e) => handleIngredientChange(index, "quantity", Number.parseFloat(e.target.value))}
                          placeholder="Quantity"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={ingredient.notes || ""}
                          onChange={(e) => handleIngredientChange(index, "notes", e.target.value)}
                          placeholder="Notes"
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveIngredient(index)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Recipe"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
