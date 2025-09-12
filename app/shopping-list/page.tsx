import ShoppingList from '@/components/ShoppingList'

export default function ShoppingListPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Lista de Compras</h1>
      <ShoppingList />
    </div>
  )
}
