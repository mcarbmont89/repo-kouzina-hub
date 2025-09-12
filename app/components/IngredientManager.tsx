'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash, Save, X, Edit } from 'lucide-react'

interface Ingredient {
  id: string
  name: string
  unit: string
  cost: string
  provider: string
}

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, 'id'>>({ 
    name: '', 
    unit: '', 
    cost: '', 
    provider: '' 
  })
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchIngredients()
  }, [])

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

  const handleSave = async () => {
    try {
      if (!newIngredient.name.trim() || isNaN(parseFloat(newIngredient.cost)) || parseFloat(newIngredient.cost) <= 0) {
        toast({
          title: "Error",
          description: "Name and a positive cost are required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/ingredients', {
        method: editingIngredientId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingIngredientId ? { id: editingIngredientId, ...newIngredient } : newIngredient),
      })

      if (!response.ok) throw new Error('Failed to save ingredient')

      await fetchIngredients()
      setNewIngredient({ name: '', unit: '', cost: '', provider: '' })
      setEditingIngredientId(null)
      toast({
        title: "Success",
        description: `Ingredient ${editingIngredientId ? 'updated' : 'added'} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingIngredientId ? 'update' : 'add'} ingredient`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (ingredient: Ingredient) => {
    setNewIngredient({ 
      name: ingredient.name, 
      unit: ingredient.unit, 
      cost: ingredient.cost.toString(),
      provider: ingredient.provider
    })
    setEditingIngredientId(ingredient.id)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ingredients?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete ingredient')

      await fetchIngredients()
      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Ingredient Manager</h2>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Ingredient name"
          value={newIngredient.name}
          onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Unit"
          value={newIngredient.unit}
          onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Unit Cost (€)"
          value={newIngredient.cost}
          onChange={(e) => setNewIngredient(prev => ({ ...prev, cost: e.target.value }))}
        />
        <Input
          placeholder="Provider"
          value={newIngredient.provider}
          onChange={(e) => setNewIngredient(prev => ({ ...prev, provider: e.target.value }))}
        />
        <Button onClick={handleSave}>
          {editingIngredientId ? 'Update' : 'Add'} Ingredient
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Unit Cost (€)</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>{ingredient.name}</TableCell>
              <TableCell>{ingredient.unit}</TableCell>
              <TableCell>{parseFloat(ingredient.cost).toFixed(2)}</TableCell>
              <TableCell>{ingredient.provider}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(ingredient)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(ingredient.id)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
