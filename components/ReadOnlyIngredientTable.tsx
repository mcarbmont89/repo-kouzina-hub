'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { useToast } from "@/components/ui/use-toast"

interface Ingredient {
  id: string
  name: string
  unit: string
  cost: string
  provider: string
}

export default function ReadOnlyIngredientTable() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients')
        if (!response.ok) throw new Error('Failed to fetch ingredients')
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

    fetchIngredients()
  }, [toast])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ingredient</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Unit Cost (€)</TableHead>
          <TableHead>Provider</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingredients.map((ingredient) => (
          <TableRow key={ingredient.id}>
            <TableCell>{ingredient.name}</TableCell>
            <TableCell>{ingredient.unit}</TableCell>
            <TableCell>{parseFloat(ingredient.cost).toFixed(2)}</TableCell>
            <TableCell>{ingredient.provider}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
