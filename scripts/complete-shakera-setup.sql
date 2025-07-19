-- Complete setup for Shakera Bazaar with all products and featured product

-- First, create the seller
INSERT INTO sellers (id, email, name, shop_name, created_at) VALUES 
('660e8400-e29b-41d4-a716-446655440001', 'shakera@dressshop.com', 'Shakera', 'Shakera Bazaar', NOW())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  shop_name = EXCLUDED.shop_name;

-- Delete any existing products for this seller to start fresh
DELETE FROM products WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001';

-- Create dress products with proper images
INSERT INTO products (seller_id, name, price, image_url, stock_quantity, created_at) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Elegant Evening Dress',
  89.99,
  'https://images.unsplash.com/photo-1566479179817-0af86d5fd6db?w=400&h=500&fit=crop',
  15,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Summer Floral Maxi Dress',
  65.00,
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
  20,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Casual Cotton Sundress',
  45.50,
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
  25,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Business Professional Dress',
  120.00,
  'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400&h=500&fit=crop',
  12,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Bohemian Style Midi Dress',
  75.99,
  'https://images.unsplash.com/photo-1623070774461-bf90fd24ff7e?w=400&h=500&fit=crop',
  18,
  NOW()
);

-- Create or update the live sale with the featured product
INSERT INTO live_sales (id, seller_id, active, featured_product_id, facebook_live_url, created_at, updated_at) 
VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  true,
  (SELECT id FROM products WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001' AND name = 'Elegant Evening Dress' LIMIT 1),
  'https://www.facebook.com/100063778163383/videos/1284413386447517/',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  featured_product_id = EXCLUDED.featured_product_id,
  facebook_live_url = EXCLUDED.facebook_live_url,
  updated_at = NOW(); 