interface Ingredient {
  name: string;
  cost: number;
  amount: number;
}

interface Recipe {
  name: string;
  ingredients: Ingredient[];
}

export function calculateIngredientCosts(
  ordersPerDish: Record<string, number>,
  sellingPrices: Record<string, number>,
  commissions: number,
  recipes: Recipe[]
) {
  const ingredientDf: Record<string, number> = {};
  const costDf: Record<string, any>[] = [];

  recipes.forEach((recipe) => {
    const orders = ordersPerDish[recipe.name] || 0;
    const sellingPrice = sellingPrices[recipe.name] || 0;
    let totalCost = 0;

    recipe.ingredients.forEach((ingredient) => {
      const totalAmount = ingredient.amount * orders;
      const ingredientCost = ingredient.cost * totalAmount;
      
      ingredientDf[ingredient.name] = (ingredientDf[ingredient.name] || 0) + totalAmount;
      totalCost += ingredientCost;
    });

    const margin = sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;
    const adjustedPrice = sellingPrice * (1 + commissions);

    costDf.push({
      Dish: recipe.name,
      "Cost per Dish (€)": totalCost / orders,
      "Selling Price (€)": sellingPrice,
      "Margin (%)": margin,
      "Adjusted Price (Commission) (€)": adjustedPrice,
    });
  });

  return { ingredientDf, costDf };
}
