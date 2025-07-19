-- First, let's completely reset and fix the RLS policies
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Sellers can update orders for their sales" ON orders;

-- Create completely open policies for orders (since this is a demo)
CREATE POLICY "Public can insert orders" ON orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can view orders" ON orders 
FOR SELECT 
USING (true);

CREATE POLICY "Public can update orders" ON orders 
FOR UPDATE 
USING (true);

-- Also ensure other tables have proper policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Public can view products" ON products 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can view live sales" ON live_sales;
CREATE POLICY "Public can view live sales" ON live_sales 
FOR SELECT 
USING (true);

-- Ensure sellers table allows demo access
DROP POLICY IF EXISTS "Sellers can view own data" ON sellers;
CREATE POLICY "Public can view sellers" ON sellers 
FOR SELECT 
USING (true);

-- Clear existing demo data and recreate with proper user
DELETE FROM orders WHERE sale_id IN (SELECT id FROM live_sales WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000');
DELETE FROM live_sales WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM products WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM sellers WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert demo seller (this will be linked to the auth user)
INSERT INTO sellers (id, email, name, shop_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@khshop.com', 'Demo Seller', 'KH Shop');

-- Insert demo bag products with real images
INSERT INTO products (seller_id, name, price, image_url, stock_quantity) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Classic Black Leather Handbag', 25.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 8),
('550e8400-e29b-41d4-a716-446655440000', 'Brown Crossbody Bag', 18.00, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop', 12),
('550e8400-e29b-41d4-a716-446655440000', 'Designer Tote Bag', 35.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop', 5),
('550e8400-e29b-41d4-a716-446655440000', 'Mini Backpack Pink', 22.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 7),
('550e8400-e29b-41d4-a716-446655440000', 'Evening Clutch Gold', 15.00, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', 10),
('550e8400-e29b-41d4-a716-446655440000', 'Canvas Shoulder Bag', 12.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 15),
('550e8400-e29b-41d4-a716-446655440000', 'Luxury Chain Bag', 45.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop', 3),
('550e8400-e29b-41d4-a716-446655440000', 'Travel Duffle Bag', 28.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 6);

-- Insert demo live sale
INSERT INTO live_sales (seller_id, active, featured_product_id, facebook_live_url) 
SELECT '550e8400-e29b-41d4-a716-446655440000', true, id, 'https://www.facebook.com/LadiesFashion168/videos/1235976934927436/'
FROM products 
WHERE name = 'Classic Black Leather Handbag' 
LIMIT 1;
