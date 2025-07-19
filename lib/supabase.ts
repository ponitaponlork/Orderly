import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your-actual-supabase-url' || 
    supabaseAnonKey === 'your-actual-supabase-anon-key') {
  throw new Error('Please configure your Supabase environment variables in .env.local file. Replace the placeholder values with your actual Supabase URL and anon key.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      sellers: {
        Row: {
          id: string
          email: string
          name: string
          shop_name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          shop_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          shop_name?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          price: number
          image_url: string
          stock_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          name: string
          price: number
          image_url: string
          stock_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          name?: string
          price?: number
          image_url?: string
          stock_quantity?: number
          created_at?: string
        }
      }
      live_sales: {
        Row: {
          id: string
          seller_id: string
          active: boolean
          featured_product_id: string | null
          facebook_live_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          active?: boolean
          featured_product_id?: string | null
          facebook_live_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          active?: boolean
          featured_product_id?: string | null
          facebook_live_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          sale_id: string
          customer_name: string
          customer_contact: string
          customer_address: string
          items: any
          total_amount: number
          payment_method: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          customer_name: string
          customer_contact: string
          customer_address: string
          items: any
          total_amount: number
          payment_method: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          customer_name?: string
          customer_contact?: string
          customer_address?: string
          items?: any
          total_amount?: number
          payment_method?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}
