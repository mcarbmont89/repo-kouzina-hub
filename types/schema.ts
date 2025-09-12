// Base types with common fields for all entities
export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

// Main entities
export interface Restaurant extends BaseEntity {
  name: string
  description: string
  location?: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
}

export interface Provider extends BaseEntity {
  name: string
  description: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  is_active: boolean
}

export interface Ingredient extends BaseEntity {
  name: string
  description?: string
  unit: string
  cost_per_unit: number
  provider_id: string
  in_stock?: number
  min_stock_level?: number
  is_active: boolean
}

export interface Recipe extends BaseEntity {
  restaurant_id: string
  name: string
  description?: string
  category?: string
  preparation_time_minutes?: number
  cooking_time_minutes?: number
  serving_size?: number
  is_active: boolean
}

export interface RecipeIngredient extends BaseEntity {
  recipe_id: string
  ingredient_id: string
  quantity: number
  notes?: string
}

export interface Order extends BaseEntity {
  restaurant_id: string
  order_date: string
  status: "pending" | "processing" | "completed" | "cancelled"
  total_amount: number
  customer_name?: string
  customer_contact?: string
  notes?: string
}

export interface OrderItem extends BaseEntity {
  order_id: string
  recipe_id: string
  quantity: number
  unit_price: number
  notes?: string
}

// Derived/computed types
export interface IngredientWithProvider extends Ingredient {
  provider_name: string
}

export interface RecipeWithDetails extends Recipe {
  restaurant_name: string
  ingredients: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    cost_per_unit: number
    total_cost: number
  }>
  total_cost: number
  suggested_price: number
  profit_margin: number
}

export interface ShoppingListItem {
  ingredient_id: string
  ingredient_name: string
  provider_id: string
  provider_name: string
  unit: string
  quantity_needed: number
  cost_per_unit: number
  total_cost: number
  restaurants: Array<{
    id: string
    name: string
    quantity: number
  }>
}

// Configuration and settings
export interface CostSettings {
  id: string
  target_profit_margin: number
  default_commission_rate: number
  currency: string
  updated_at: string
}
