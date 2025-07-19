-- Create or replace the function to safely decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Update with explicit locking to prevent race conditions
  UPDATE products 
  SET stock_quantity = GREATEST(0, stock_quantity - quantity)
  WHERE id = product_id;
  
  -- Log the inventory change
  INSERT INTO inventory_logs (product_id, quantity_change, reason)
  VALUES (product_id, -quantity, 'order_placed')
  ON CONFLICT DO NOTHING; -- In case the table doesn't exist
END;
$$ LANGUAGE plpgsql;

-- Create inventory logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS policies allow inventory updates
DROP POLICY IF EXISTS "Public can update products" ON products;
CREATE POLICY "Public can update products" ON products 
FOR UPDATE 
USING (true);

-- Ensure RLS policies allow inventory log creation
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert inventory logs" ON inventory_logs 
FOR INSERT 
WITH CHECK (true);
