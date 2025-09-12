import IngredientManager from '@/components/IngredientManager'

export default function IngredientsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Ingredientes</h1>
      <IngredientManager />
    </div>
  )
}
