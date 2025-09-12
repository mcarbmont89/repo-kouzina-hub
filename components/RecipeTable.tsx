'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from 'lucide-react'
import { Recipe } from '@/hooks/useRecipes'

interface RecipeTableProps {
  recipes: Recipe[]
  onEdit: (recipe: Recipe) => void
}

export default function RecipeTable({ recipes, onEdit }: RecipeTableProps) {
  // Implement delete functionality here

  return (
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
            <TableCell>{recipe.restaurant}</TableCell>
            <TableCell>{recipe.dishName}</TableCell>
            <TableCell>
              <ul className="list-disc list-inside">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.ingredientId}: {ingredient.amount}
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(recipe)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {/* Implement delete */}}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
