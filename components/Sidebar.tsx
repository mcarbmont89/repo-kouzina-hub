"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChefHat, Calculator, FileText, ShoppingCart, Users, Upload, Home, LogOut, Package } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Recetas", href: "/recipes", icon: ChefHat },
  { name: "Ingredientes", href: "/ingredients", icon: Package },
  { name: "Análisis de Costos", href: "/cost-analysis", icon: Calculator },
  { name: "Reportes", href: "/reports", icon: FileText },
  { name: "Lista de Compras", href: "/shopping-list", icon: ShoppingCart },
  { name: "Subir CSV", href: "/csv-upload", icon: Upload },
  { name: "Inventario", href: "/inventory-upload", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <ChefHat className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">KouzinaHub</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {session && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">{session.user?.name?.charAt(0) || "U"}</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{session.user?.name || "Usuario"}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </div>
  )
}
