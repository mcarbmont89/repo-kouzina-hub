import { z } from "zod"
import type { Restaurant, Provider, Ingredient, Recipe, RecipeIngredient, Order, OrderItem } from "@/types/schema"

// Restaurant validation schema
export const restaurantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Provider validation schema
export const providerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Provider name is required"),
  description: z.string().optional(),
  contact_person: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Ingredient validation schema
export const ingredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ingredient name is required"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  cost_per_unit: z.number().positive("Cost must be greater than 0"),
  provider_id: z.string().min(1, "Provider is required"),
  in_stock: z.number().nonnegative().optional(),
  min_stock_level: z.number().nonnegative().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Recipe validation schema
export const recipeSchema = z.object({
  id: z.string().optional(),
  restaurant_id: z.string().min(1, "Restaurant is required"),
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  preparation_time_minutes: z.number().nonnegative().optional(),
  cooking_time_minutes: z.number().nonnegative().optional(),
  serving_size: z.number().positive().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// RecipeIngredient validation schema
export const recipeIngredientSchema = z.object({
  id: z.string().optional(),
  recipe_id: z.string().min(1, "Recipe is required"),
  ingredient_id: z.string().min(1, "Ingredient is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Order validation schema
export const orderSchema = z.object({
  id: z.string().optional(),
  restaurant_id: z.string().min(1, "Restaurant is required"),
  order_date: z.string().min(1, "Order date is required"),
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
  total_amount: z.number().nonnegative(),
  customer_name: z.string().optional(),
  customer_contact: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// OrderItem validation schema
export const orderItemSchema = z.object({
  id: z.string().optional(),
  order_id: z.string().min(1, "Order is required"),
  recipe_id: z.string().min(1, "Recipe is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit_price: z.number().nonnegative(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Validation functions
export function validateRestaurant(data: unknown): {
  success: boolean
  data?: Restaurant
  error?: string
} {
  try {
    const validData = restaurantSchema.parse(data)
    return { success: true, data: validData as Restaurant }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid restaurant data" }
  }
}

export function validateProvider(data: unknown): {
  success: boolean
  data?: Provider
  error?: string
} {
  try {
    const validData = providerSchema.parse(data)
    return { success: true, data: validData as Provider }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid provider data" }
  }
}

export function validateIngredient(data: unknown): {
  success: boolean
  data?: Ingredient
  error?: string
} {
  try {
    const validData = ingredientSchema.parse(data)
    return { success: true, data: validData as Ingredient }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid ingredient data" }
  }
}

export function validateRecipe(data: unknown): {
  success: boolean
  data?: Recipe
  error?: string
} {
  try {
    const validData = recipeSchema.parse(data)
    return { success: true, data: validData as Recipe }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid recipe data" }
  }
}

export function validateRecipeIngredient(data: unknown): {
  success: boolean
  data?: RecipeIngredient
  error?: string
} {
  try {
    const validData = recipeIngredientSchema.parse(data)
    return { success: true, data: validData as RecipeIngredient }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid recipe ingredient data" }
  }
}

export function validateOrder(data: unknown): {
  success: boolean
  data?: Order
  error?: string
} {
  try {
    const validData = orderSchema.parse(data)
    return { success: true, data: validData as Order }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid order data" }
  }
}

export function validateOrderItem(data: unknown): {
  success: boolean
  data?: OrderItem
  error?: string
} {
  try {
    const validData = orderItemSchema.parse(data)
    return { success: true, data: validData as OrderItem }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      }
    }
    return { success: false, error: "Invalid order item data" }
  }
}
