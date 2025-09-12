export function calculateIngredientCosts(orders_per_dish, selling_prices, commissions = 0.0) {
  // Ingredient requirements per dish (in kg or units per order)
  const ingredient_requirements = {
    "Taco al Pastor": {
      "Tortilla (12 cm)": 0.02,
      "Carne de pastor (kg)": 0.05,
      "Piña (kg)": 0.005,
      "Cebolla (kg)": 0.005,
      "Cilantro (kg)": 0.002,
    },
    "Taco de Cochinita Pibil": {
      "Tortilla (12 cm)": 0.02,
      "Cochinita pibil (kg)": 0.05,
      "Cebolla morada encurtida (kg)": 0.005,
      "Cilantro (kg)": 0.002,
    },
    // ... (add all other dishes here)
  };

  // Unit costs for each ingredient
  const unit_costs = {
    "Tortilla (12 cm)": 0.19 / 0.02,
    "Tortilla (15 cm)": 0.25 / 0.025,
    "Carne de pastor (kg)": 16.00,
    "Cochinita pibil (kg)": 14.00,
    // ... (add all other ingredient costs here)
  };

  // Initialize ingredient totals and dish costs
  const ingredient_totals = {};
  const dish_costs = {};

  // Calculate ingredient totals based on orders
  for (const [dish, ingredients] of Object.entries(ingredient_requirements)) {
    const orders = orders_per_dish[dish] || 0;
    let dish_cost = 0;
    for (const [ingredient, amount_per_order] of Object.entries(ingredients)) {
      if (!(ingredient in ingredient_totals)) {
        ingredient_totals[ingredient] = 0;
      }
      ingredient_totals[ingredient] += orders * amount_per_order;
      dish_cost += amount_per_order * unit_costs[ingredient];
    }
    dish_costs[dish] = dish_cost;
  }

  // Calculate selling prices, margins, and adjusted prices
  const results = [];
  for (const [dish, cost] of Object.entries(dish_costs)) {
    const selling_price = selling_prices[dish] || 0;
    const margin = selling_price > 0 ? ((selling_price - cost) / selling_price) * 100 : 0;
    const adjusted_price = selling_price * (1 + commissions);
    results.push({
      "Dish": dish,
      "Cost per Dish (€)": cost,
      "Selling Price (€)": selling_price,
      "Margin (%)": margin,
      "Adjusted Price (Commission) (€)": adjusted_price,
    });
  }

  const ingredient_df = Object.entries(ingredient_totals).map(([ingredient, volume]) => ({
    "Ingredient": ingredient,
    "Volume (kg or units/week)": volume,
    "Unit Cost (€)": unit_costs[ingredient],
    "Total Weekly Cost (€)": volume * unit_costs[ingredient],
  }));

  return { ingredient_df, cost_df: results };
}
