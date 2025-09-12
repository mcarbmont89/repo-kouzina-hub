"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Clock, Users } from "lucide-react"

interface Recipe {
  id: string
  name: string
  description: string
  preparationTime: number
  servings: number
  ingredients: string[]
  instructions: string[]
  cost: number
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading recipes
    setTimeout(() => {
      setRecipes([
        {
          id: "1",
          name: "Pasta Carbonara",
          description: "Pasta italiana clásica con huevo, queso y panceta",
          preparationTime: 20,
          servings: 4,
          ingredients: ["Pasta", "Huevos", "Queso Parmesano", "Panceta", "Pimienta"],
          instructions: ["Cocinar pasta", "Preparar salsa", "Mezclar"],
          cost: 12.5,
        },
        {
          id: "2",
          name: "Ensalada César",
          description: "Ensalada fresca con aderezo césar casero",
          preparationTime: 15,
          servings: 2,
          ingredients: ["Lechuga", "Crutones", "Queso Parmesano", "Aderezo César"],
          instructions: ["Lavar lechuga", "Preparar aderezo", "Mezclar ingredientes"],
          cost: 8.75,
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
    toast({
      title: "Receta eliminada",
      description: "La receta ha sido eliminada correctamente",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recetas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus recetas y calcula costos</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Receta
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar recetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{recipe.name}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {recipe.preparationTime} min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {recipe.servings} porciones
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ingredientes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                      <li key={index}>• {ingredient}</li>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <li className="text-gray-400">+ {recipe.ingredients.length - 3} más</li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <span className="text-lg font-bold text-green-600">${recipe.cost.toFixed(2)}</span>
                    <span className="text-sm text-gray-500 ml-1">costo</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRecipe(recipe.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron recetas</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primera receta"}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Receta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
