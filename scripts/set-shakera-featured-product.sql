-- Set the Elegant Evening Dress as the featured product for Shakera Bazaar
UPDATE live_sales 
SET featured_product_id = (
  SELECT id FROM products 
  WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001' 
  AND name = 'Elegant Evening Dress' 
  LIMIT 1
),
updated_at = NOW()
WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001'; 