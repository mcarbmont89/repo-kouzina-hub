'use client'

import { useParams } from 'next/navigation'
import { recipes } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecipeDetail() {
  const params = useParams()
  const recipe = recipes.find(r => r.id === Number(params.id))

  if (!recipe) {
    return <div>Receta no encontrada</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{recipe.name}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Receta</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Categoría:</strong> {recipe.category}</p>
          <p><strong>Ingredientes:</strong></p>
          <ul className="list-disc list-inside">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
