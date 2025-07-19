-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create live_sales table for real-time featured product tracking
CREATE TABLE IF NOT EXISTS live_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  featured_product_id UUID REFERENCES products(id),
  facebook_live_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES live_sales(id),
  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for sellers
CREATE POLICY "Sellers can view own data" ON sellers FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Sellers can update own data" ON sellers FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid()::text = seller_id::text);

-- Create policies for live_sales
CREATE POLICY "Anyone can view live sales" ON live_sales FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own live sales" ON live_sales FOR ALL USING (auth.uid()::text = seller_id::text);

-- Create policies for orders
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Sellers can view orders for their sales" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM live_sales 
    WHERE live_sales.id = orders.sale_id 
    AND live_sales.seller_id::text = auth.uid()::text
  )
);
