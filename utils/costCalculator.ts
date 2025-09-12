import type { Recipe, Ingredient, Order, CostAnalysisResult } from "@/types"

interface IngredientMap {
  [id: string]: Ingredient
}

interface RecipeMap {
  [id: string]: Recipe
}

export function calculateRecipeCost(recipe: Recipe, ingredientsMap: IngredientMap): number {
  return recipe.ingredients.reduce((total, item) => {
    const ingredient = ingredientsMap[item.ingredientId]
    if (!ingredient) return total

    const amount = Number.parseFloat(item.amount) || 0
    const cost = Number.parseFloat(ingredient.cost) || 0

    return total + amount * cost
  }, 0)
}

export function calculateSellingPrice(cost: number, targetMargin: number): number {
  // Avoid division by zero
  if (targetMargin >= 1) return cost * 2 // Default to 100% markup

  return cost / (1 - targetMargin)
}

export function calculateMargin(sellingPrice: number, cost: number): number {
  if (sellingPrice <= 0) return 0
  return ((sellingPrice - cost) / sellingPrice) * 100
}

export function analyzeCosts(
  recipes: Recipe[],
  ingredients: Ingredient[],
  orders: Order[],
  targetMargin = 0.3,
): CostAnalysisResult[] {
  // Create maps for faster lookups
  const ingredientsMap: IngredientMap = ingredients.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {} as IngredientMap)

  const recipesMap: RecipeMap = recipes.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {} as RecipeMap)

  // Count orders per dish
  const ordersPerDish: Record<string, number> = {}
  orders.forEach((order) => {
    const recipe = recipesMap[order.dishId]
    if (!recipe) return

    const dishName = recipe.dishName
    ordersPerDish[dishName] = (ordersPerDish[dishName] || 0) + order.amount
  })

  // Calculate costs and prices
  return recipes.map((recipe) => {
    const cost = calculateRecipeCost(recipe, ingredientsMap)
    const sellingPrice = calculateSellingPrice(cost, targetMargin)
    const margin = calculateMargin(sellingPrice, cost)
    const weeklyOrders = ordersPerDish[recipe.dishName] || 0

    return {
      dish: recipe.dishName,
      costPerDish: cost,
      sellingPrice: sellingPrice,
      margin: margin,
      weeklyRevenue: sellingPrice * weeklyOrders,
    }
  })
}
