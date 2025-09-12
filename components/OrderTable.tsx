"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash, Save, X, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import type { Order, Recipe, Restaurant, OrderItem } from "@/types/schema"

interface OrderTableProps {
  orders: Order[]
  recipes: Recipe[]
  restaurants: Restaurant[]
  onUpdate: (order: Order) => void
  onDelete: (id: string) => void
}

export function OrderTable({ orders, recipes, restaurants, onUpdate, onDelete }: OrderTableProps) {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editingOrderItems, setEditingOrderItems] = useState<OrderItem[]>([])

  const handleUpdateOrder = () => {
    if (editingOrder) {
      // Calculate total amount from order items
      const totalAmount = editingOrderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

      // Update the order with the new total amount
      const updatedOrder = {
        ...editingOrder,
        total_amount: totalAmount,
      }

      onUpdate(updatedOrder)
      setEditingOrder(null)
      setEditingOrderItems([])
    }
  }

  const handleEditOrder = (order: Order, orderItems: OrderItem[]) => {
    setEditingOrder(order)
    setEditingOrderItems(orderItems || [])
  }

  const handleAddOrderItem = () => {
    if (editingOrder) {
      setEditingOrderItems([
        ...editingOrderItems,
        {
          id: "",
          order_id: editingOrder.id,
          recipe_id: "",
          quantity: 1,
          unit_price: 0,
          notes: "",
        },
      ])
    }
  }

  const handleOrderItemChange = (index: number, field: keyof OrderItem, value: any) => {
    setEditingOrderItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleRemoveOrderItem = (index: number) => {
    setEditingOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateItemTotal = (item: OrderItem) => {
    return item.quantity * item.unit_price
  }

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">
                  {editingOrder?.id === order.id ? (
                    <Select
                      value={editingOrder.restaurant_id}
                      onValueChange={(value) => setEditingOrder({ ...editingOrder, restaurant_id: value })}
                    >
                      <SelectTrigger className="w-[200px]">
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
                  ) : (
                    restaurants.find((restaurant) => restaurant.id === order.restaurant_id)?.name ||
                    "Unknown Restaurant"
                  )}
                </h3>
                <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                  {editingOrder?.id === order.id ? (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[200px] justify-start text-left font-normal",
                              !editingOrder.order_date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editingOrder.order_date ? (
                              format(new Date(editingOrder.order_date), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(editingOrder.order_date)}
                            onSelect={(date) =>
                              date && setEditingOrder({ ...editingOrder, order_date: date.toISOString() })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={editingOrder.status}
                        onValueChange={(value: "pending" | "processing" | "completed" | "cancelled") =>
                          setEditingOrder({ ...editingOrder, status: value })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <span>Date: {format(new Date(order.order_date), "PPP")}</span>
                      <span>•</span>
                      <span>Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                {editingOrder?.id === order.id ? (
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateOrder}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingOrder(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditOrder(order, [])}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete(order.id)}>
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {editingOrder?.id === order.id && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input
                    value={editingOrder.customer_name || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Customer Contact</label>
                  <Input
                    value={editingOrder.customer_contact || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_contact: e.target.value })}
                    placeholder="Customer contact"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={editingOrder.notes || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    placeholder="Order notes"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            {editingOrder?.id === order.id ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Order Items</h4>
                  <Button size="sm" onClick={handleAddOrderItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipe</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price (€)</TableHead>
                      <TableHead>Total (€)</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editingOrderItems.map((item, index) => (
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
                                .filter((recipe) => recipe.restaurant_id === editingOrder.restaurant_id)
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
                            onChange={(e) =>
                              handleOrderItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)
                            }
                            placeholder="Quantity"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleOrderItemChange(index, "unit_price", Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="Unit Price"
                          />
                        </TableCell>
                        <TableCell>{calculateItemTotal(item).toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            value={item.notes || ""}
                            onChange={(e) => handleOrderItemChange(index, "notes", e.target.value)}
                            placeholder="Notes"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveOrderItem(index)}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total:
                      </TableCell>
                      <TableCell className="font-bold">{calculateOrderTotal(editingOrderItems).toFixed(2)} €</TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            ) : (
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipe</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price (€)</TableHead>
                      <TableHead>Total (€)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would need to be populated with the actual order items */}
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No items to display
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total:
                      </TableCell>
                      <TableCell className="font-bold">{order.total_amount.toFixed(2)} €</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}

            {!editingOrder && (
              <div className="mt-4 text-sm text-muted-foreground">
                {order.customer_name && (
                  <div>
                    <span className="font-medium">Customer:</span> {order.customer_name}
                  </div>
                )}
                {order.customer_contact && (
                  <div>
                    <span className="font-medium">Contact:</span> {order.customer_contact}
                  </div>
                )}
                {order.notes && (
                  <div>
                    <span className="font-medium">Notes:</span> {order.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
