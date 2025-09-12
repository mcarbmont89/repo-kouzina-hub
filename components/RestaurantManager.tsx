"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Trash, Edit } from "lucide-react"
import type { Restaurant } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function RestaurantManager() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [newRestaurant, setNewRestaurant] = useState<Omit<Restaurant, "id" | "created_at" | "updated_at">>({
    name: "",
    description: "",
    location: "",
    contact_email: "",
    contact_phone: "",
    is_active: true,
  })
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRestaurants()
  }, [])

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

  const handleSave = async () => {
    try {
      if (!newRestaurant.name.trim()) {
        toast({
          title: "Error",
          description: "Restaurant name is required",
          variant: "destructive",
        })
        return
      }

      if (newRestaurant.description.length > 200) {
        toast({
          title: "Error",
          description: "Description must be 200 characters or less",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/restaurants", {
        method: editingRestaurantId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRestaurantId ? { id: editingRestaurantId, ...newRestaurant } : newRestaurant),
      })

      if (!response.ok) throw new Error("Failed to save restaurant")

      await fetchRestaurants()
      setNewRestaurant({
        name: "",
        description: "",
        location: "",
        contact_email: "",
        contact_phone: "",
        is_active: true,
      })
      setEditingRestaurantId(null)
      toast({
        title: "Success",
        description: `Restaurant ${editingRestaurantId ? "updated" : "added"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingRestaurantId ? "update" : "add"} restaurant`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (restaurant: Restaurant) => {
    setNewRestaurant({
      name: restaurant.name,
      description: restaurant.description,
      location: restaurant.location,
      contact_email: restaurant.contact_email,
      contact_phone: restaurant.contact_phone,
      is_active: restaurant.is_active,
    })
    setEditingRestaurantId(restaurant.id)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/restaurants?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete restaurant")

      await fetchRestaurants()
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete restaurant",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Restaurant Manager</h2>
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Restaurant name"
          value={newRestaurant.name}
          onChange={(e) => setNewRestaurant((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Textarea
          placeholder="Description"
          value={newRestaurant.description}
          onChange={(e) => setNewRestaurant((prev) => ({ ...prev, description: e.target.value }))}
        />
        <Input
          placeholder="Location"
          value={newRestaurant.location || ""}
          onChange={(e) => setNewRestaurant((prev) => ({ ...prev, location: e.target.value }))}
        />
        <Input
          type="email"
          placeholder="Contact Email"
          value={newRestaurant.contact_email || ""}
          onChange={(e) => setNewRestaurant((prev) => ({ ...prev, contact_email: e.target.value }))}
        />
        <Input
          placeholder="Contact Phone"
          value={newRestaurant.contact_phone || ""}
          onChange={(e) => setNewRestaurant((prev) => ({ ...prev, contact_phone: e.target.value }))}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-active"
            checked={newRestaurant.is_active}
            onCheckedChange={(checked) => setNewRestaurant((prev) => ({ ...prev, is_active: checked === true }))}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
        <Button onClick={handleSave}>{editingRestaurantId ? "Update" : "Add"} Restaurant</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow key={restaurant.id}>
              <TableCell>{restaurant.name}</TableCell>
              <TableCell className="truncate max-w-[200px]">{restaurant.description}</TableCell>
              <TableCell>{restaurant.location}</TableCell>
              <TableCell>{restaurant.contact_email}</TableCell>
              <TableCell>{restaurant.contact_phone}</TableCell>
              <TableCell>{restaurant.is_active ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(restaurant)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(restaurant.id)}>
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
