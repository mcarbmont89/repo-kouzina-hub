import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import type {
  BaseEntity,
  Restaurant,
  Provider,
  Ingredient,
  Recipe,
  RecipeIngredient,
  Order,
  OrderItem,
  IngredientWithProvider,
  RecipeWithDetails,
  ShoppingListItem,
} from "@/types/schema"

// Constants
const DATA_DIR = path.join(process.cwd(), "data")
const FILE_NAMES = {
  restaurants: "restaurants.json",
  providers: "providers.json",
  ingredients: "ingredients.json",
  recipes: "recipes.json",
  recipeIngredients: "recipe_ingredients.json",
  orders: "orders.json",
  orderItems: "order_items.json",
  settings: "settings.json",
}

// Helper functions
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function readJsonFile<T>(fileName: string): Promise<T[]> {
  await ensureDataDir()
  try {
    const filePath = path.join(DATA_DIR, fileName)
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await fs.writeFile(path.join(DATA_DIR, fileName), "[]")
      return []
    }
    throw error
  }
}

async function writeJsonFile<T>(fileName: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, fileName)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// Generic CRUD operations
async function getAll<T extends BaseEntity>(fileName: string): Promise<T[]> {
  return readJsonFile<T>(fileName)
}

async function getById<T extends BaseEntity>(fileName: string, id: string): Promise<T | null> {
  const items = await readJsonFile<T>(fileName)
  return items.find((item) => item.id === id) || null
}

async function create<T extends BaseEntity>(
  fileName: string,
  data: Omit<T, "id" | "created_at" | "updated_at">,
): Promise<T> {
  const items = await readJsonFile<T>(fileName)
  const now = new Date().toISOString()

  const newItem = {
    ...data,
    id: uuidv4(),
    created_at: now,
    updated_at: now,
  } as T

  items.push(newItem)
  await writeJsonFile(fileName, items)
  return newItem
}

async function update<T extends BaseEntity>(
  fileName: string,
  id: string,
  data: Partial<Omit<T, "id" | "created_at" | "updated_at">>,
): Promise<T | null> {
  const items = await readJsonFile<T>(fileName)
  const index = items.findIndex((item) => item.id === id)

  if (index === -1) return null

  const now = new Date().toISOString()
  items[index] = {
    ...items[index],
    ...data,
    updated_at: now,
  }

  await writeJsonFile(fileName, items)
  return items[index]
}

async function remove<T extends BaseEntity>(fileName: string, id: string): Promise<boolean> {
  const items = await readJsonFile<T>(fileName)
  const filteredItems = items.filter((item) => item.id !== id)

  if (filteredItems.length === items.length) return false

  await writeJsonFile(fileName, filteredItems)
  return true
}

// Specific entity operations
// Restaurants
export async function getAllRestaurants(): Promise<Restaurant[]> {
  return getAll<Restaurant>(FILE_NAMES.restaurants)
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  return getById<Restaurant>(FILE_NAMES.restaurants, id)
}

export async function createRestaurant(
  data: Omit<Restaurant, "id" | "created_at" | "updated_at">,
): Promise<Restaurant> {
  return create<Restaurant>(FILE_NAMES.restaurants, data)
}

export async function updateRestaurant(
  id: string,
  data: Partial<Omit<Restaurant, "id" | "created_at" | "updated_at">>,
): Promise<Restaurant | null> {
  return update<Restaurant>(FILE_NAMES.restaurants, id, data)
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  return remove<Restaurant>(FILE_NAMES.restaurants, id)
}

// Providers
export async function getAllProviders(): Promise<Provider[]> {
  return getAll<Provider>(FILE_NAMES.providers)
}

export async function getProviderById(id: string): Promise<Provider | null> {
  return getById<Provider>(FILE_NAMES.providers, id)
}

export async function createProvider(data: Omit<Provider, "id" | "created_at" | "updated_at">): Promise<Provider> {
  return create<Provider>(FILE_NAMES.providers, data)
}

export async function updateProvider(
  id: string,
  data: Partial<Omit<Provider, "id" | "created_at" | "updated_at">>,
): Promise<Provider | null> {
  return update<Provider>(FILE_NAMES.providers, id, data)
}

export async function deleteProvider(id: string): Promise<boolean> {
  return remove<Provider>(FILE_NAMES.providers, id)
}

// Ingredients
export async function getAllIngredients(): Promise<Ingredient[]> {
  return getAll<Ingredient>(FILE_NAMES.ingredients)
}

export async function getIngredientById(id: string): Promise<Ingredient | null> {
  return getById<Ingredient>(FILE_NAMES.ingredients, id)
}

export async function createIngredient(
  data: Omit<Ingredient, "id" | "created_at" | "updated_at">,
): Promise<Ingredient> {
  return create<Ingredient>(FILE_NAMES.ingredients, data)
}

export async function updateIngredient(
  id: string,
  data: Partial<Omit<Ingredient, "id" | "created_at" | "updated_at">>,
): Promise<Ingredient | null> {
  return update<Ingredient>(FILE_NAMES.ingredients, id, data)
}

export async function deleteIngredient(id: string): Promise<boolean> {
  return remove<Ingredient>(FILE_NAMES.ingredients, id)
}

// Get ingredients with provider details
export async function getIngredientsWithProviders(): Promise<IngredientWithProvider[]> {
  const [ingredients, providers] = await Promise.all([getAllIngredients(), getAllProviders()])

  return ingredients.map((ingredient) => {
    const provider = providers.find((p) => p.id === ingredient.provider_id)
    return {
      ...ingredient,
      provider_name: provider?.name || "Unknown Provider",
    }
  })
}

// Recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  return getAll<Recipe>(FILE_NAMES.recipes)
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return getById<Recipe>(FILE_NAMES.recipes, id)
}

export async function createRecipe(data: Omit<Recipe, "id" | "created_at" | "updated_at">): Promise<Recipe> {
  return create<Recipe>(FILE_NAMES.recipes, data)
}

export async function updateRecipe(
  id: string,
  data: Partial<Omit<Recipe, "id" | "created_at" | "updated_at">>,
): Promise<Recipe | null> {
  return update<Recipe>(FILE_NAMES.recipes, id, data)
}

export async function deleteRecipe(id: string): Promise<boolean> {
  // First delete all recipe ingredients
  const recipeIngredients = await getAll<RecipeIngredient>(FILE_NAMES.recipeIngredients)
  const filteredIngredients = recipeIngredients.filter((ri) => ri.recipe_id !== id)
  await writeJsonFile(FILE_NAMES.recipeIngredients, filteredIngredients)

  // Then delete the recipe
  return remove<Recipe>(FILE_NAMES.recipes, id)
}

// Recipe Ingredients
export async function getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
  const allIngredients = await getAll<RecipeIngredient>(FILE_NAMES.recipeIngredients)
  return allIngredients.filter((ri) => ri.recipe_id === recipeId)
}

export async function addIngredientToRecipe(
  data: Omit<RecipeIngredient, "id" | "created_at" | "updated_at">,
): Promise<RecipeIngredient> {
  return create<RecipeIngredient>(FILE_NAMES.recipeIngredients, data)
}

export async function updateRecipeIngredient(
  id: string,
  data: Partial<Omit<RecipeIngredient, "id" | "created_at" | "updated_at">>,
): Promise<RecipeIngredient | null> {
  return update<RecipeIngredient>(FILE_NAMES.recipeIngredients, id, data)
}

export async function removeIngredientFromRecipe(id: string): Promise<boolean> {
  return remove<RecipeIngredient>(FILE_NAMES.recipeIngredients, id)
}

// Get recipe with details
export async function getRecipeWithDetails(recipeId: string): Promise<RecipeWithDetails | null> {
  const [recipe, recipeIngredients, ingredients, restaurants] = await Promise.all([
    getRecipeById(recipeId),
    getRecipeIngredients(recipeId),
    getAllIngredients(),
    getAllRestaurants(),
  ])

  if (!recipe) return null

  const restaurant = restaurants.find((r) => r.id === recipe.restaurant_id)

  const ingredientDetails = recipeIngredients
    .map((ri) => {
      const ingredient = ingredients.find((i) => i.id === ri.ingredient_id)
      if (!ingredient) return null

      const totalCost = ri.quantity * ingredient.cost_per_unit

      return {
        id: ingredient.id,
        name: ingredient.name,
        quantity: ri.quantity,
        unit: ingredient.unit,
        cost_per_unit: ingredient.cost_per_unit,
        total_cost: totalCost,
      }
    })
    .filter(Boolean) as RecipeWithDetails["ingredients"]

  const totalCost = ingredientDetails.reduce((sum, item) => sum + item.total_cost, 0)
  const targetMargin = 0.3 // 30% profit margin - could be configurable
  const suggestedPrice = totalCost / (1 - targetMargin)

  return {
    ...recipe,
    restaurant_name: restaurant?.name || "Unknown Restaurant",
    ingredients: ingredientDetails,
    total_cost: totalCost,
    suggested_price: suggestedPrice,
    profit_margin: targetMargin * 100,
  }
}

// Orders
export async function getAllOrders(): Promise<Order[]> {
  return getAll<Order>(FILE_NAMES.orders)
}

export async function getOrderById(id: string): Promise<Order | null> {
  return getById<Order>(FILE_NAMES.orders, id)
}

export async function createOrder(data: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
  return create<Order>(FILE_NAMES.orders, data)
}

export async function updateOrder(
  id: string,
  data: Partial<Omit<Order, "id" | "created_at" | "updated_at">>,
): Promise<Order | null> {
  return update<Order>(FILE_NAMES.orders, id, data)
}

export async function deleteOrder(id: string): Promise<boolean> {
  // First delete all order items
  const orderItems = await getAll<OrderItem>(FILE_NAMES.orderItems)
  const filteredItems = orderItems.filter((oi) => oi.order_id !== id)
  await writeJsonFile(FILE_NAMES.orderItems, filteredItems)

  // Then delete the order
  return remove<Order>(FILE_NAMES.orders, id)
}

// Order Items
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const allItems = await getAll<OrderItem>(FILE_NAMES.orderItems)
  return allItems.filter((oi) => oi.order_id === orderId)
}

export async function addItemToOrder(data: Omit<OrderItem, "id" | "created_at" | "updated_at">): Promise<OrderItem> {
  return create<OrderItem>(FILE_NAMES.orderItems, data)
}

export async function updateOrderItem(
  id: string,
  data: Partial<Omit<OrderItem, "id" | "created_at" | "updated_at">>,
): Promise<OrderItem | null> {
  return update<OrderItem>(FILE_NAMES.orderItems, id, data)
}

export async function removeItemFromOrder(id: string): Promise<boolean> {
  return remove<OrderItem>(FILE_NAMES.orderItems, id)
}

// Shopping List
export async function generateShoppingList(restaurantIds?: string[]): Promise<ShoppingListItem[]> {
  const [ingredients, providers, recipes, recipeIngredients, orders, orderItems] = await Promise.all([
    getAllIngredients(),
    getAllProviders(),
    getAllRecipes(),
    getAll<RecipeIngredient>(FILE_NAMES.recipeIngredients),
    getAllOrders(),
    getAll<OrderItem>(FILE_NAMES.orderItems),
  ])

  // Filter orders by restaurant if specified
  const filteredOrders = restaurantIds ? orders.filter((o) => restaurantIds.includes(o.restaurant_id)) : orders

  // Get all order items for these orders
  const relevantOrderItems = orderItems.filter((oi) => filteredOrders.some((o) => o.id === oi.order_id))

  // Calculate ingredient quantities needed
  const ingredientNeeds: Record<string, Record<string, number>> = {}

  for (const orderItem of relevantOrderItems) {
    const recipe = recipes.find((r) => r.id === orderItem.recipe_id)
    if (!recipe) continue

    const recipeIngs = recipeIngredients.filter((ri) => ri.recipe_id === recipe.id)

    for (const ri of recipeIngs) {
      if (!ingredientNeeds[ri.ingredient_id]) {
        ingredientNeeds[ri.ingredient_id] = {}
      }

      if (!ingredientNeeds[ri.ingredient_id][recipe.restaurant_id]) {
        ingredientNeeds[ri.ingredient_id][recipe.restaurant_id] = 0
      }

      ingredientNeeds[ri.ingredient_id][recipe.restaurant_id] += ri.quantity * orderItem.quantity
    }
  }

  // Convert to shopping list format
  const shoppingList: ShoppingListItem[] = []

  for (const [ingredientId, restaurantQuantities] of Object.entries(ingredientNeeds)) {
    const ingredient = ingredients.find((i) => i.id === ingredientId)
    if (!ingredient) continue

    const provider = providers.find((p) => p.id === ingredient.provider_id)

    const restaurantDetails = Object.entries(restaurantQuantities).map(([restaurantId, quantity]) => {
      const recipe = recipes.find((r) => r.restaurant_id === restaurantId)
      return {
        id: restaurantId,
        name: recipe?.name || "Unknown Restaurant",
        quantity,
      }
    })

    const totalQuantity = Object.values(restaurantQuantities).reduce((sum, q) => sum + q, 0)

    shoppingList.push({
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      provider_id: ingredient.provider_id,
      provider_name: provider?.name || "Unknown Provider",
      unit: ingredient.unit,
      quantity_needed: totalQuantity,
      cost_per_unit: ingredient.cost_per_unit,
      total_cost: totalQuantity * ingredient.cost_per_unit,
      restaurants: restaurantDetails,
    })
  }

  // Group by provider
  return shoppingList.sort((a, b) => a.provider_name.localeCompare(b.provider_name))
}
