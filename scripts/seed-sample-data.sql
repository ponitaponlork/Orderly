-- Insert sample seller
INSERT INTO sellers (id, email, name, shop_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'srey@boutique.com', 'Srey Mom', 'Srey''s Boutique');

-- Insert sample products with Cambodian market prices
INSERT INTO products (seller_id, name, price, image_url, stock_quantity) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Blue Floral Summer Dress', 7.00, '/placeholder.svg?height=400&width=300', 5),
('550e8400-e29b-41d4-a716-446655440000', 'White Cotton Blouse', 5.00, '/placeholder.svg?height=400&width=300', 8),
('550e8400-e29b-41d4-a716-446655440000', 'Black Skinny Jeans', 12.00, '/placeholder.svg?height=400&width=300', 3),
('550e8400-e29b-41d4-a716-446655440000', 'Red Evening Dress', 15.00, '/placeholder.svg?height=400&width=300', 2),
('550e8400-e29b-41d4-a716-446655440000', 'Casual T-Shirt', 3.00, '/placeholder.svg?height=400&width=300', 12),
('550e8400-e29b-41d4-a716-446655440000', 'Denim Jacket', 18.00, '/placeholder.svg?height=400&width=300', 4),
('550e8400-e29b-41d4-a716-446655440000', 'Striped Maxi Dress', 10.00, '/placeholder.svg?height=400&width=300', 6),
('550e8400-e29b-41d4-a716-446655440000', 'Pink Cardigan', 8.00, '/placeholder.svg?height=400&width=300', 7);

-- Update the sample products with real fashion images
UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop'
WHERE name = 'Blue Floral Summer Dress';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop'
WHERE name = 'White Cotton Blouse';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop'
WHERE name = 'Black Skinny Jeans';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=500&fit=crop'
WHERE name = 'Red Evening Dress';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'
WHERE name = 'Casual T-Shirt';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop'
WHERE name = 'Denim Jacket';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop'
WHERE name = 'Striped Maxi Dress';

UPDATE products SET 
  image_url = 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=500&fit=crop'
WHERE name = 'Pink Cardigan';

-- Insert sample live sale
INSERT INTO live_sales (seller_id, active, featured_product_id) 
SELECT '550e8400-e29b-41d4-a716-446655440000', true, id 
FROM products 
WHERE name = 'Blue Floral Summer Dress' 
LIMIT 1;
