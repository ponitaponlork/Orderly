-- Update the Facebook Live URL for Shakera Bazaar
UPDATE live_sales 
SET facebook_live_url = 'https://www.facebook.com/100063778163383/videos/1284413386447517/',
    updated_at = NOW()
WHERE seller_id = '660e8400-e29b-41d4-a716-446655440001'; 