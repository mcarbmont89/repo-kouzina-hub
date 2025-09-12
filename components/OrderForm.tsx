"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import type { Order, Recipe, Restaurant } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash } from "lucide-react"

interface OrderFormProps {
  onSubmit: (order: Omit<Order, "id" | "created_at" | "updated_at">) => void
  recipes: Recipe[]
  restaurants: Restaurant[]
}

export function OrderForm({ onSubmit, recipes, restaurants }: OrderFormProps) {
  const [newOrder, setNewOrder] = useState<Omit<Order, "id" | "created_at" | "updated_at">>({
    restaurant_id: "",
    order_date: new Date().toISOString(),
    status: "pending",
    total_amount: 0,
    customer_name: "",
    customer_contact: "",
    notes: "",
    items: [],
  })
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    setFilteredRecipes(recipes.filter((recipe) => recipe.restaurant_id === newOrder.restaurant_id))
  }, [newOrder.restaurant_id, recipes])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrder.restaurant_id || !newOrder.customer_name || !newOrder.customer_contact) {
      return // Add error handling here
    }
    onSubmit(newOrder)
    setNewOrder({
      restaurant_id: "",
      order_date: new Date().toISOString(),
      status: "pending",
      total_amount: 0,
      customer_name: "",
      customer_contact: "",
      notes: "",
      items: [],
    })
  }

  const handleAddOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...(newOrder.items || []), { recipe_id: "", quantity: 1, unit_price: 0, notes: "" }],
    })
  }

  const handleRemoveOrderItem = (index: number) => {
    const newItems = [...(newOrder.items || [])]
    newItems.splice(index, 1)
    setNewOrder({ ...newOrder, items: newItems })
  }

  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const newItems = [...(newOrder.items || [])]
    newItems[index] = { ...newItems[index], [field]: value }
    setNewOrder({ ...newOrder, items: newItems })
  }

  const calculateTotalAmount = () => {
    return (newOrder.items || []).reduce((total, item) => total + item.quantity * item.unit_price, 0)
  }

  const handleClear = () => {
    setNewOrder({
      restaurant_id: "",
      order_date: new Date().toISOString(),
      status: "pending",
      total_amount: 0,
      customer_name: "",
      customer_contact: "",
      notes: "",
      items: [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Restaurant</label>
          <Select
            value={newOrder.restaurant_id}
            onValueChange={(value) => setNewOrder({ ...newOrder, restaurant_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a restaurant" />
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
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newOrder.order_date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newOrder.order_date ? format(new Date(newOrder.order_date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(newOrder.order_date)}
                onSelect={(date) => date && setNewOrder({ ...newOrder, order_date: date.toISOString() })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={newOrder.status}
            onValueChange={(value: "pending" | "processing" | "completed" | "cancelled") =>
              setNewOrder({ ...newOrder, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Customer Name</label>
          <Input
            value={newOrder.customer_name || ""}
            onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
            placeholder="Customer name"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Customer Contact</label>
          <Input
            value={newOrder.customer_contact || ""}
            onChange={(e) => setNewOrder({ ...newOrder, customer_contact: e.target.value })}
            placeholder="Customer contact"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={newOrder.notes || ""}
            onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
            placeholder="Order notes"
            rows={3}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Order Items</label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddOrderItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newOrder.items?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Select
                    value={item.recipe_id}
                    onValueChange={(value) => handleOrderItemChange(index, "recipe_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes
                        .filter((recipe) => recipe.restaurant_id === newOrder.restaurant_id)
                        .map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleOrderItemChange(index, "quantity", Number.parseInt(e.target.value))}
                    placeholder="Quantity"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => handleOrderItemChange(index, "unit_price", Number.parseFloat(e.target.value))}
                    placeholder="Unit Price"
                  />
                </TableCell>
                <TableCell>{(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                <TableCell>
                  <Input
                    value={item.notes || ""}
                    onChange={(e) => handleOrderItemChange(index, "notes", e.target.value)}
                    placeholder="Notes"
                  />
                </TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOrderItem(index)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">
                Total Amount:
              </TableCell>
              <TableCell className="font-bold">{calculateTotalAmount().toFixed(2)} €</TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Submit Order</Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </form>
  )
}
