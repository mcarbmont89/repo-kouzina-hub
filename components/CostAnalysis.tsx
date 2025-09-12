'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { CostChart } from './CostChart'

interface Order {
  Dish: string
  'Weekly Orders': string
}

interface Recipe {
  Dish: string
  Ingredient: string
  'Amount per Order': string
}

interface IngredientCost {
  Ingredient: string
  'Unit Cost (€)': string
}

export default function CostAnalysis() {
  const [orders, setOrders] = useState<Order[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredientCosts, setIngredientCosts] = useState<IngredientCost[]>([])
  const [commissions, setCommissions] = useState(0.30)
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, recipesRes, ingredientsRes] = await Promise.all([
          fetch('/api/fetch-csv?type=orders'),
          fetch('/api/fetch-csv?type=recipes'),
          fetch('/api/fetch-csv?type=ingredients')
        ])

        if (!ordersRes.ok || !recipesRes.ok || !ingredientsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [ordersData, recipesData, ingredientsData] = await Promise.all([
          ordersRes.json(),
          recipesRes.json(),
          ingredientsRes.json()
        ])

        setOrders(ordersData)
        setRecipes(recipesData)
        setIngredientCosts(ingredientsData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const calculateCosts = () => {
    const results = orders.map(order => {
      const dish = order.Dish
      const weeklyOrders = parseInt(order['Weekly Orders']) || 0
      const dishRecipes = recipes.filter(recipe => recipe.Dish === dish)
      
      let cost = 0
      dishRecipes.forEach(recipe => {
        const ingredient = ingredientCosts.find(ing => ing.Ingredient === recipe.Ingredient)
        if (ingredient) {
          const amountPerOrder = parseFloat(recipe['Amount per Order']) || 0
          const unitCost = parseFloat(ingredient['Unit Cost (€)']) || 0
          cost += amountPerOrder * unitCost
        }
      })

      const sellingPrice = cost / (1 - commissions)
      const margin = ((sellingPrice - cost) / sellingPrice) * 100

      return {
        Dish: dish,
        'Weekly Orders': weeklyOrders,
        'Cost per Dish (€)': isNaN(cost) ? '0.00' : cost.toFixed(2),
        'Selling Price (€)': isNaN(sellingPrice) ? '0.00' : sellingPrice.toFixed(2),
        'Margin (%)': isNaN(margin) ? '0.00' : margin.toFixed(2),
        'Weekly Revenue (€)': isNaN(sellingPrice * weeklyOrders) ? '0.00' : (sellingPrice * weeklyOrders).toFixed(2)
      }
    })

    setResults(results)
  }

  if (isLoading) {
    return <div>Loading data...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Análisis de Costos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commission">Comisión (%)</Label>
              <Input 
                id="commission"
                type="number" 
                value={commissions * 100} 
                onChange={(e) => setCommissions(parseFloat(e.target.value) / 100)}
              />
            </div>
            <Button onClick={calculateCosts}>Calcular Costos</Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <CostChart data={results} />
            <table className="w-full mt-4">
              <thead>
                <tr>
                  <th>Plato</th>
                  <th>Órdenes Semanales</th>
                  <th>Costo por Plato (€)</th>
                  <th>Precio de Venta (€)</th>
                  <th>Margen (%)</th>
                  <th>Ingresos Semanales (€)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row: any, index: number) => (
                  <tr key={index}>
                    <td>{row.Dish}</td>
                    <td>{row['Weekly Orders'].toString()}</td>
                    <td>{row['Cost per Dish (€)'].toString()}</td>
                    <td>{row['Selling Price (€)'].toString()}</td>
                    <td>{row['Margin (%)'].toString()}</td>
                    <td>{row['Weekly Revenue (€)'].toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
