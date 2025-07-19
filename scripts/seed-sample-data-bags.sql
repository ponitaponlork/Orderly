-- Clear existing data
DELETE FROM orders;
DELETE FROM live_sales;
DELETE FROM products;
DELETE FROM sellers;

-- Insert sample seller for KH Shop
INSERT INTO sellers (id, email, name, shop_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'kh@shop.com', 'Sophea Kim', 'KH Shop');

-- Insert sample bag products with real images and Cambodian market prices
INSERT INTO products (seller_id, name, price, image_url, stock_quantity) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Classic Black Leather Handbag', 25.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 8),
('550e8400-e29b-41d4-a716-446655440000', 'Brown Crossbody Bag', 18.00, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop', 12),
('550e8400-e29b-41d4-a716-446655440000', 'Designer Tote Bag', 35.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop', 5),
('550e8400-e29b-41d4-a716-446655440000', 'Mini Backpack Pink', 22.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 7),
('550e8400-e29b-41d4-a716-446655440000', 'Evening Clutch Gold', 15.00, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', 10),
('550e8400-e29b-41d4-a716-446655440000', 'Canvas Shoulder Bag', 12.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 15),
('550e8400-e29b-41d4-a716-446655440000', 'Luxury Chain Bag', 45.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop', 3),
('550e8400-e29b-41d4-a716-446655440000', 'Travel Duffle Bag', 28.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', 6);

-- Insert sample live sale
INSERT INTO live_sales (seller_id, active, featured_product_id, facebook_live_url) 
SELECT '550e8400-e29b-41d4-a716-446655440000', true, id, 'https://www.facebook.com/LadiesFashion168/videos/1235976934927436/'
FROM products 
WHERE name = 'Classic Black Leather Handbag' 
LIMIT 1;
