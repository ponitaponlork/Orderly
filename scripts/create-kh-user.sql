-- First, let's ensure we have the KH Shop seller record with the correct email
DELETE FROM sellers WHERE email = 'kh@gmail.com';

-- Create or update the KH Shop seller record
INSERT INTO sellers (id, email, name, shop_name)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'kh@gmail.com', 'KH Shop Owner', 'KH Shop')
ON CONFLICT (id) DO UPDATE 
SET email = 'kh@gmail.com', name = 'KH Shop Owner', shop_name = 'KH Shop';

-- Make sure we have some products for this seller
INSERT INTO products (seller_id, name, price, image_url, stock_quantity)
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Classic Black Leather Handbag', 25.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 8
WHERE NOT EXISTS (SELECT 1 FROM products WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1);

-- Ensure we have a live sale record
INSERT INTO live_sales (seller_id, active, facebook_live_url)
SELECT '550e8400-e29b-41d4-a716-446655440000', true, 'https://www.facebook.com/LadiesFashion168/videos/1235976934927436/'
WHERE NOT EXISTS (SELECT 1 FROM live_sales WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1);

-- Update the featured product if needed
UPDATE live_sales 
SET featured_product_id = (
  SELECT id FROM products 
  WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000' 
  LIMIT 1
)
WHERE seller_id = '550e8400-e29b-41d4-a716-446655440000' 
AND featured_product_id IS NULL;
