export interface Restaurant {
  id: string
  name: string
  description: string
  location?: string
  contactInfo?: string
}

export interface Provider {
  id: string
  name: string
  description: string
  contactInfo?: string
  address?: string
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  cost: string
  provider: string // Provider ID
  inStock?: number
  minStockLevel?: number
}

export interface RecipeIngredient {
  ingredientId: string
  amount: string
}

export interface Recipe {
  id: string
  restaurantId: string
  dishName: string
  ingredients: RecipeIngredient[]
  category?: string
  preparationTime?: number
  isActive?: boolean
}

export interface Order {
  id: string
  restaurantId: string
  dishId: string
  amount: number
  date: Date
  timestamp: number
  status?: "pending" | "completed" | "cancelled"
  customerInfo?: string
}

export interface AggregatedIngredient extends Ingredient {
  totalAmount: number
  totalCost: number
}

export interface PlannedRecipes {
  [recipeId: string]: number
}

export interface CostAnalysisResult {
  dish: string
  costPerDish: number
  sellingPrice: number
  margin: number
  weeklyRevenue: number
}

export interface ShoppingListItem {
  ingredientId: string
  name: string
  amount: number
  unit: string
  unitCost: number
  totalCost: number
  providerId: string
  restaurantId: string
}
