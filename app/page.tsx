import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Calculator, FileText, ShoppingCart, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      title: "Gestión de Recetas",
      description: "Administra tus recetas y calcula costos automáticamente",
      icon: ChefHat,
      href: "/recipes",
    },
    {
      title: "Análisis de Costos",
      description: "Analiza los costos de ingredientes y optimiza precios",
      icon: Calculator,
      href: "/cost-analysis",
    },
    {
      title: "Reportes",
      description: "Genera reportes detallados de costos y rentabilidad",
      icon: FileText,
      href: "/reports",
    },
    {
      title: "Lista de Compras",
      description: "Genera listas de compras basadas en tus recetas",
      icon: ShoppingCart,
      href: "/shopping-list",
    },
    {
      title: "Gestión de Ingredientes",
      description: "Administra tu inventario de ingredientes",
      icon: Users,
      href: "/ingredients",
    },
    {
      title: "Subir CSV",
      description: "Importa datos desde archivos CSV",
      icon: TrendingUp,
      href: "/csv-upload",
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido a KouzinaHub</h1>
        <p className="text-gray-600">Sistema integral de gestión de costos y recetas para restaurantes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Recetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Ingredientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-gray-500">+12 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Costo Promedio por Plato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€8.50</div>
            <p className="text-xs text-gray-500">-€0.30 desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
