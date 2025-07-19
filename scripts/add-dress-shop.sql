-- Add a new dress seller
INSERT INTO sellers (id, email, name, shop_name, created_at) VALUES 
('660e8400-e29b-41d4-a716-446655440001', 'shakera@dressshop.com', 'Shakera', 'Shakera Bazaar', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add dress products for the new seller
INSERT INTO products (seller_id, name, price, image_url, stock_quantity, created_at) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440001',
  'Elegant Evening Dress',
  89.99,
  'https://i.pinimg.com/736x/7d/b6/f5/7db6f5ef7f32094accff7b7088113e74.jpgw=400&h=500&fit=crop',
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

-- Create a live sale for the dress shop
INSERT INTO live_sales (id, seller_id, active, featured_product_id, facebook_live_url, created_at, updated_at) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  true,
  (SELECT id FROM products WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001' AND name = 'Elegant Evening Dress' LIMIT 1),
  'https://www.facebook.com/100063778163383/videos/1284413386447517/',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Add another fashion seller for variety
INSERT INTO sellers (id, email, name, shop_name, created_at) VALUES 
('660e8400-e29b-41d4-a716-446655440002', 'maria@stylecloset.com', 'Maria', 'Style Closet', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add more dress products for the second seller
INSERT INTO products (seller_id, name, price, image_url, stock_quantity, created_at) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440002',
  'Designer Cocktail Dress',
  150.00,
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop',
  8,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  'Vintage Polka Dot Dress',
  55.00,
  'https://images.unsplash.com/photo-1583981905806-2d5a731b0c00?w=400&h=500&fit=crop',
  22,
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  'Winter Wool Dress',
  95.99,
  'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=400&h=500&fit=crop',
  14,
  NOW()
);

-- Create a live sale for the second fashion shop
INSERT INTO live_sales (id, seller_id, active, featured_product_id, facebook_live_url, created_at, updated_at) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440002',
  true,
  (SELECT id FROM products WHERE seller_id = '660e8400-e29b-41d4-a716-446655440002' AND name = 'Designer Cocktail Dress' LIMIT 1),
  'https://www.facebook.com/watch/live/?ref=watch_permalink&v=1234567891',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Update the Facebook Live URL for Shakera Bazaar
UPDATE live_sales 
SET facebook_live_url = 'https://www.facebook.com/100063778163383/videos/1284413386447517/',
    updated_at = NOW()
WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001'; 