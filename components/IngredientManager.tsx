"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Trash, Edit } from "lucide-react"
import type { Ingredient, Provider } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, "id" | "created_at" | "updated_at">>({
    name: "",
    description: "",
    unit: "",
    cost_per_unit: 0,
    provider_id: "",
    in_stock: 0,
    min_stock_level: 0,
    is_active: true,
  })
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchIngredients()
    fetchProviders()
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

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers")
      if (!response.ok) throw new Error("Failed to fetch providers")
      const data = await response.json()
      setProviders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch providers",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      if (
        !newIngredient.name.trim() ||
        isNaN(Number(newIngredient.cost_per_unit)) ||
        Number(newIngredient.cost_per_unit) <= 0
      ) {
        toast({
          title: "Error",
          description: "Name and a positive cost are required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/ingredients", {
        method: editingIngredientId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingIngredientId ? { id: editingIngredientId, ...newIngredient } : newIngredient),
      })

      if (!response.ok) throw new Error("Failed to save ingredient")

      await fetchIngredients()
      setNewIngredient({
        name: "",
        description: "",
        unit: "",
        cost_per_unit: 0,
        provider_id: "",
        in_stock: 0,
        min_stock_level: 0,
        is_active: true,
      })
      setEditingIngredientId(null)
      toast({
        title: "Success",
        description: `Ingredient ${editingIngredientId ? "updated" : "added"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingIngredientId ? "update" : "add"} ingredient`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (ingredient: Ingredient) => {
    setNewIngredient({
      name: ingredient.name,
      description: ingredient.description || "",
      unit: ingredient.unit,
      cost_per_unit: ingredient.cost_per_unit,
      provider_id: ingredient.provider_id,
      in_stock: ingredient.in_stock,
      min_stock_level: ingredient.min_stock_level,
      is_active: ingredient.is_active,
    })
    setEditingIngredientId(ingredient.id)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ingredients?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete ingredient")

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Ingredient name"
          value={newIngredient.name}
          onChange={(e) => setNewIngredient((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Unit (e.g., kg, liter, piece)"
          value={newIngredient.unit}
          onChange={(e) => setNewIngredient((prev) => ({ ...prev, unit: e.target.value }))}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Cost Per Unit (€)"
          value={newIngredient.cost_per_unit === 0 ? "" : newIngredient.cost_per_unit}
          onChange={(e) =>
            setNewIngredient((prev) => ({ ...prev, cost_per_unit: Number.parseFloat(e.target.value) || 0 }))
          }
        />
        <Select
          value={newIngredient.provider_id}
          onValueChange={(value) => setNewIngredient((prev) => ({ ...prev, provider_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          step="0.01"
          placeholder="Current Stock"
          value={newIngredient.in_stock === 0 ? "" : newIngredient.in_stock}
          onChange={(e) => setNewIngredient((prev) => ({ ...prev, in_stock: Number.parseFloat(e.target.value) || 0 }))}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Minimum Stock Level"
          value={newIngredient.min_stock_level === 0 ? "" : newIngredient.min_stock_level}
          onChange={(e) =>
            setNewIngredient((prev) => ({ ...prev, min_stock_level: Number.parseFloat(e.target.value) || 0 }))
          }
        />
        <Textarea
          placeholder="Description"
          value={newIngredient.description || ""}
          onChange={(e) => setNewIngredient((prev) => ({ ...prev, description: e.target.value }))}
          className="col-span-2"
        />
        <div className="flex items-center space-x-2 col-span-2">
          <Checkbox
            id="is-active"
            checked={newIngredient.is_active}
            onCheckedChange={(checked) => setNewIngredient((prev) => ({ ...prev, is_active: checked === true }))}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave}>{editingIngredientId ? "Update" : "Add"} Ingredient</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Cost Per Unit (€)</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>In Stock</TableHead>
            <TableHead>Min. Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>{ingredient.name}</TableCell>
              <TableCell>{ingredient.unit}</TableCell>
              <TableCell>{ingredient.cost_per_unit.toFixed(2)}</TableCell>
              <TableCell>{providers.find((p) => p.id === ingredient.provider_id)?.name || "Unknown"}</TableCell>
              <TableCell>{ingredient.in_stock?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>{ingredient.min_stock_level?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>{ingredient.is_active ? "Active" : "Inactive"}</TableCell>
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
