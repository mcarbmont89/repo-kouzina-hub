// This file contains SQL statements that will be used to create tables in Supabase
// when you're ready to migrate from JSON files to a database

export const createTablesSql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC(10, 2) NOT NULL CHECK (cost_per_unit > 0),
  provider_id UUID NOT NULL REFERENCES providers(id),
  in_stock NUMERIC(10, 2) DEFAULT 0,
  min_stock_level NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  preparation_time_minutes INTEGER,
  cooking_time_minutes INTEGER,
  serving_size INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Ingredients junction table
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.3,
  default_commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.05,
  currency TEXT NOT NULL DEFAULT 'EUR',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ingredients_provider_id ON ingredients(provider_id);
CREATE INDEX idx_recipes_restaurant_id ON recipes(restaurant_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_recipe_id ON order_items(recipe_id);

-- Create views for common queries
CREATE VIEW recipe_details AS
SELECT 
  r.id,
  r.name,
  r.restaurant_id,
  rest.name AS restaurant_name,
  r.category,
  r.preparation_time_minutes,
  r.cooking_time_minutes,
  r.serving_size,
  r.is_active,
  COUNT(ri.id) AS ingredient_count,
  SUM(ri.quantity * i.cost_per_unit) AS total_cost
FROM recipes r
JOIN restaurants rest ON r.restaurant_id = rest.id
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
GROUP BY r.id, rest.name;

-- Create a view for shopping list generation
CREATE VIEW shopping_list AS
SELECT 
  i.id AS ingredient_id,
  i.name AS ingredient_name,
  i.unit,
  p.id AS provider_id,
  p.name AS provider_name,
  SUM(ri.quantity * oi.quantity) AS quantity_needed,
  i.cost_per_unit,
  SUM(ri.quantity * oi.quantity * i.cost_per_unit) AS total_cost,
  r.restaurant_id,
  rest.name AS restaurant_name
FROM order_items oi
JOIN recipes r ON oi.recipe_id = r.id
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
JOIN providers p ON i.provider_id = p.id
JOIN restaurants rest ON r.restaurant_id = rest.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('pending', 'processing')
GROUP BY i.id, i.name, i.unit, p.id, p.name, i.cost_per_unit, r.restaurant_id, rest.name;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION calculate_recipe_cost(recipe_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_cost NUMERIC;
BEGIN
  SELECT SUM(ri.quantity * i.cost_per_unit) INTO total_cost
  FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = $1;
  
  RETURN COALESCE(total_cost, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to update order total amount
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT SUM(quantity * unit_price)
    FROM order_items
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update order total amount
CREATE TRIGGER update_order_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();
`

// Function to convert JSON data to SQL INSERT statements
export function generateInsertStatements(
  restaurants: any[],
  providers: any[],
  ingredients: any[],
  recipes: any[],
  recipeIngredients: any[],
  orders: any[],
  orderItems: any[],
): string {
  let sql = ""

  // Insert restaurants
  for (const r of restaurants) {
    sql += `INSERT INTO restaurants (id, name, description, location, contact_email, contact_phone, is_active, created_at, updated_at)
    VALUES ('${r.id}', '${escapeSql(r.name)}', '${escapeSql(r.description || "")}', '${escapeSql(r.location || "")}', 
    '${escapeSql(r.contact_email || "")}', '${escapeSql(r.contact_phone || "")}', ${r.is_active}, 
    '${r.created_at || new Date().toISOString()}', '${r.updated_at || new Date().toISOString()}');\n`
  }

  // Insert providers
  for (const p of providers) {
    sql += `INSERT INTO providers (id, name, description, contact_person, contact_email, contact_phone, address, is_active, created_at, updated_at)
    VALUES ('${p.id}', '${escapeSql(p.name)}', '${escapeSql(p.description || "")}', '${escapeSql(p.contact_person || "")}', 
    '${escapeSql(p.contact_email || "")}', '${escapeSql(p.contact_phone || "")}', '${escapeSql(p.address || "")}', ${p.is_active}, 
    '${p.created_at || new Date().toISOString()}', '${p.updated_at || new Date().toISOString()}');\n`
  }

  // Insert ingredients
  for (const i of ingredients) {
    sql += `INSERT INTO ingredients (id, name, description, unit, cost_per_unit, provider_id, in_stock, min_stock_level, is_active, created_at, updated_at)
    VALUES ('${i.id}', '${escapeSql(i.name)}', '${escapeSql(i.description || "")}', '${escapeSql(i.unit)}', ${i.cost_per_unit}, 
    '${i.provider_id}', ${i.in_stock || 0}, ${i.min_stock_level || 0}, ${i.is_active}, 
    '${i.created_at || new Date().toISOString()}', '${i.updated_at || new Date().toISOString()}');\n`
  }

  // Insert recipes
  for (const r of recipes) {
    sql += `INSERT INTO recipes (id, restaurant_id, name, description, category, preparation_time_minutes, cooking_time_minutes, serving_size, is_active, created_at, updated_at)
    VALUES ('${r.id}', '${r.restaurant_id}', '${escapeSql(r.name)}', '${escapeSql(r.description || "")}', '${escapeSql(r.category || "")}', 
    ${r.preparation_time_minutes || "NULL"}, ${r.cooking_time_minutes || "NULL"}, ${r.serving_size || "NULL"}, ${r.is_active}, 
    '${r.created_at || new Date().toISOString()}', '${r.updated_at || new Date().toISOString()}');\n`
  }

  // Insert recipe ingredients
  for (const ri of recipeIngredients) {
    sql += `INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, notes, created_at, updated_at)
    VALUES ('${ri.id}', '${ri.recipe_id}', '${ri.ingredient_id}', ${ri.quantity}, '${escapeSql(ri.notes || "")}', 
    '${ri.created_at || new Date().toISOString()}', '${ri.updated_at || new Date().toISOString()}');\n`
  }

  // Insert orders
  for (const o of orders) {
    sql += `INSERT INTO orders (id, restaurant_id, order_date, status, total_amount, customer_name, customer_contact, notes, created_at, updated_at)
    VALUES ('${o.id}', '${o.restaurant_id}', '${o.order_date}', '${o.status}', ${o.total_amount}, 
    '${escapeSql(o.customer_name || "")}', '${escapeSql(o.customer_contact || "")}', '${escapeSql(o.notes || "")}', 
    '${o.created_at || new Date().toISOString()}', '${o.updated_at || new Date().toISOString()}');\n`
  }

  // Insert order items
  for (const oi of orderItems) {
    sql += `INSERT INTO order_items (id, order_id, recipe_id, quantity, unit_price, notes, created_at, updated_at)
    VALUES ('${oi.id}', '${oi.order_id}', '${oi.recipe_id}', ${oi.quantity}, ${oi.unit_price}, '${escapeSql(oi.notes || "")}', 
    '${oi.created_at || new Date().toISOString()}', '${oi.updated_at || new Date().toISOString()}');\n`
  }

  return sql
}

// Helper function to escape SQL strings
function escapeSql(str: string): string {
  if (!str) return ""
  return str.replace(/'/g, "''")
}
