"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Trash, Edit } from "lucide-react"
import type { Provider } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function ProviderManager() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [newProvider, setNewProvider] = useState<Omit<Provider, "id" | "created_at" | "updated_at">>({
    name: "",
    description: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    is_active: true,
  })
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProviders()
  }, [])

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
      if (!newProvider.name.trim()) {
        toast({
          title: "Error",
          description: "Provider name is required",
          variant: "destructive",
        })
        return
      }

      if (newProvider.description.length > 200) {
        toast({
          title: "Error",
          description: "Description must be 200 characters or less",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/providers", {
        method: editingProviderId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProviderId ? { id: editingProviderId, ...newProvider } : newProvider),
      })

      if (!response.ok) throw new Error("Failed to save provider")

      await fetchProviders()
      setNewProvider({
        name: "",
        description: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        is_active: true,
      })
      setEditingProviderId(null)
      toast({
        title: "Success",
        description: `Provider ${editingProviderId ? "updated" : "added"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingProviderId ? "update" : "add"} provider`,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (provider: Provider) => {
    setNewProvider({
      name: provider.name,
      description: provider.description,
      contact_person: provider.contact_person,
      contact_email: provider.contact_email,
      contact_phone: provider.contact_phone,
      address: provider.address,
      is_active: provider.is_active,
    })
    setEditingProviderId(provider.id)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/providers?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete provider")

      await fetchProviders()
      toast({
        title: "Success",
        description: "Provider deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete provider",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Provider Manager</h2>
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Provider name"
          value={newProvider.name}
          onChange={(e) => setNewProvider((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Textarea
          placeholder="Description"
          value={newProvider.description}
          onChange={(e) => setNewProvider((prev) => ({ ...prev, description: e.target.value }))}
        />
        <Input
          placeholder="Contact Person"
          value={newProvider.contact_person || ""}
          onChange={(e) => setNewProvider((prev) => ({ ...prev, contact_person: e.target.value }))}
        />
        <Input
          type="email"
          placeholder="Contact Email"
          value={newProvider.contact_email || ""}
          onChange={(e) => setNewProvider((prev) => ({ ...prev, contact_email: e.target.value }))}
        />
        <Input
          placeholder="Contact Phone"
          value={newProvider.contact_phone || ""}
          onChange={(e) => setNewProvider((prev) => ({ ...prev, contact_phone: e.target.value }))}
        />
        <Textarea
          placeholder="Address"
          value={newProvider.address || ""}
          onChange={(e) => setNewProvider((prev) => ({ ...prev, address: e.target.value }))}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-active"
            checked={newProvider.is_active}
            onCheckedChange={(checked) => setNewProvider((prev) => ({ ...prev, is_active: checked === true }))}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
        <Button onClick={handleSave}>{editingProviderId ? "Update" : "Add"} Provider</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell>{provider.name}</TableCell>
              <TableCell className="truncate max-w-[200px]">{provider.description}</TableCell>
              <TableCell>{provider.contact_person}</TableCell>
              <TableCell>{provider.contact_email}</TableCell>
              <TableCell>{provider.contact_phone}</TableCell>
              <TableCell>{provider.is_active ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(provider.id)}>
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
