-- Create a function to safely decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = GREATEST(0, stock_quantity - quantity)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
