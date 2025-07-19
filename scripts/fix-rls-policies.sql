-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view orders for their sales" ON orders;

-- Create more permissive policies for orders
CREATE POLICY "Anyone can insert orders" ON orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view orders" ON orders 
FOR SELECT 
USING (true);

CREATE POLICY "Sellers can update orders for their sales" ON orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM live_sales 
    WHERE live_sales.id = orders.sale_id 
    AND live_sales.seller_id::text = auth.uid()::text
  )
);

-- Also ensure live_sales can be read by anyone (for the store page)
DROP POLICY IF EXISTS "Anyone can view live sales" ON live_sales;
CREATE POLICY "Anyone can view live sales" ON live_sales 
FOR SELECT 
USING (true);

-- Ensure products can be read by anyone
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products 
FOR SELECT 
USING (true);
