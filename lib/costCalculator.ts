import type { Recipe, Ingredient, RecipeIngredient, Order, OrderItem, CostSettings } from "@/types/schema"

// Default settings
const DEFAULT_SETTINGS: CostSettings = {
  id: "default",
  target_profit_margin: 0.3, // 30%
  default_commission_rate: 0.05, // 5%
  currency: "EUR",
  updated_at: new Date().toISOString(),
}

// Calculate the cost of a recipe based on its ingredients
export function calculateRecipeCost(
  recipe: Recipe,
  recipeIngredients: RecipeIngredient[],
  ingredients: Ingredient[],
): number {
  let totalCost = 0

  for (const ri of recipeIngredients) {
    if (ri.recipe_id !== recipe.id) continue

    const ingredient = ingredients.find((i) => i.id === ri.ingredient_id)
    if (!ingredient) continue

    totalCost += ri.quantity * ingredient.cost_per_unit
  }

  return Number.parseFloat(totalCost.toFixed(2))
}

// Calculate the suggested selling price based on cost and target margin
export function calculateSellingPrice(
  cost: number,
  targetMargin: number = DEFAULT_SETTINGS.target_profit_margin,
): number {
  if (targetMargin >= 1) {
    // If margin is 100% or more, default to doubling the cost
    return cost * 2
  }

  const price = cost / (1 - targetMargin)
  return Number.parseFloat(price.toFixed(2))
}

// Calculate the profit margin percentage
export function calculateProfitMargin(sellingPrice: number, cost: number): number {
  if (sellingPrice <= 0) return 0

  const margin = ((sellingPrice - cost) / sellingPrice) * 100
  return Number.parseFloat(margin.toFixed(2))
}

// Calculate the total revenue for a given period
export function calculateRevenue(
  orders: Order[],
  orderItems: OrderItem[],
  recipes: Recipe[],
  startDate?: Date,
  endDate?: Date,
): number {
  // Filter orders by date range if provided
  let filteredOrders = orders
  if (startDate || endDate) {
    filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.order_date)
      if (startDate && orderDate < startDate) return false
      if (endDate && orderDate > endDate) return false
      return true
    })
  }

  // Calculate total revenue
  let totalRevenue = 0

  for (const order of filteredOrders) {
    const items = orderItems.filter((item) => item.order_id === order.id)

    for (const item of items) {
      totalRevenue += item.quantity * item.unit_price
    }
  }

  return Number.parseFloat(totalRevenue.toFixed(2))
}

// Calculate the total cost for a given period
export function calculateTotalCost(
  orders: Order[],
  orderItems: OrderItem[],
  recipes: Recipe[],
  recipeIngredients: RecipeIngredient[],
  ingredients: Ingredient[],
  startDate?: Date,
  endDate?: Date,
): number {
  // Filter orders by date range if provided
  let filteredOrders = orders
  if (startDate || endDate) {
    filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.order_date)
      if (startDate && orderDate < startDate) return false
      if (endDate && orderDate > endDate) return false
      return true
    })
  }

  // Calculate total cost
  let totalCost = 0

  for (const order of filteredOrders) {
    const items = orderItems.filter((item) => item.order_id === order.id)

    for (const item of items) {
      const recipe = recipes.find((r) => r.id === item.recipe_id)
      if (!recipe) continue

      const recipeCost = calculateRecipeCost(recipe, recipeIngredients, ingredients)
      totalCost += recipeCost * item.quantity
    }
  }

  return Number.parseFloat(totalCost.toFixed(2))
}

// Calculate profit for a given period
export function calculateProfit(
  orders: Order[],
  orderItems: OrderItem[],
  recipes: Recipe[],
  recipeIngredients: RecipeIngredient[],
  ingredients: Ingredient[],
  startDate?: Date,
  endDate?: Date,
): number {
  const revenue = calculateRevenue(orders, orderItems, recipes, startDate, endDate)
  const cost = calculateTotalCost(orders, orderItems, recipes, recipeIngredients, ingredients, startDate, endDate)

  return Number.parseFloat((revenue - cost).toFixed(2))
}

// Calculate the most profitable recipes
export function getMostProfitableRecipes(
  recipes: Recipe[],
  recipeIngredients: RecipeIngredient[],
  ingredients: Ingredient[],
  orderItems: OrderItem[],
  limit = 5,
): Array<{
  recipeId: string
  recipeName: string
  totalQuantitySold: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
}> {
  const recipeStats: Record<
    string,
    {
      recipeId: string
      recipeName: string
      totalQuantitySold: number
      totalRevenue: number
      totalCost: number
    }
  > = {}

  // Calculate stats for each recipe
  for (const recipe of recipes) {
    const recipeCost = calculateRecipeCost(recipe, recipeIngredients, ingredients)
    const items = orderItems.filter((item) => item.recipe_id === recipe.id)

    let totalQuantitySold = 0
    let totalRevenue = 0

    for (const item of items) {
      totalQuantitySold += item.quantity
      totalRevenue += item.quantity * item.unit_price
    }

    recipeStats[recipe.id] = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      totalQuantitySold,
      totalRevenue,
      totalCost: recipeCost * totalQuantitySold,
    }
  }

  // Calculate profit and margin for each recipe
  const profitableRecipes = Object.values(recipeStats).map((stats) => {
    const totalProfit = stats.totalRevenue - stats.totalCost
    const profitMargin = stats.totalRevenue > 0 ? (totalProfit / stats.totalRevenue) * 100 : 0

    return {
      ...stats,
      totalProfit,
      profitMargin: Number.parseFloat(profitMargin.toFixed(2)),
    }
  })

  // Sort by profit and return top N
  return profitableRecipes.sort((a, b) => b.totalProfit - a.totalProfit).slice(0, limit)
}
