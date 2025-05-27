# 📡 Brandy Shop - API Reference

## 🔗 Base URL
```
Production: https://xrqfckeuzzgnwkutxqkx.supabase.co
Local: http://localhost:54321
```

## 🔐 Authentication

### Headers
All authenticated requests must include:
```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

### Authentication Flow
```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Logout
await supabase.auth.signOut()
```

## 👤 User Management

### Register User
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "securepassword",
  "data": {
    "full_name": "John Doe",
    "role": "artist"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "artist@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "artist"
    }
  }
}
```

### Get User Profile
```http
GET /rest/v1/profiles?id=eq.{user_id}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "artist@example.com",
  "full_name": "John Doe",
  "role": "artist",
  "avatar_url": "https://...",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile
```http
PATCH /rest/v1/profiles?id=eq.{user_id}
Content-Type: application/json

{
  "full_name": "John Smith",
  "bio": "Talented Kenyan artist",
  "avatar_url": "https://..."
}
```

## 🎨 Artist Management

### Get Artist Profile
```http
GET /rest/v1/artist_profiles?id=eq.{artist_id}
```

**Response:**
```json
{
  "id": "uuid",
  "bio": "Passionate about Kenyan culture",
  "portfolio_url": "https://...",
  "response_time": "24 hours",
  "languages": ["English", "Swahili"],
  "skills": ["Digital Art", "Traditional Patterns"],
  "total_earnings": 15000.00,
  "completed_orders": 25,
  "rating": 4.8,
  "total_reviews": 12
}
```

### Update Artist Profile
```http
PATCH /rest/v1/artist_profiles?id=eq.{artist_id}
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["Digital Art", "Logo Design"],
  "portfolio_url": "https://newportfolio.com"
}
```

## 🛍️ Product Management

### List Products
```http
GET /rest/v1/products?is_active=eq.true&order=created_at.desc
```

**Query Parameters:**
- `category_id=eq.{uuid}` - Filter by category
- `artist_id=eq.{uuid}` - Filter by artist
- `is_featured=eq.true` - Featured products only
- `limit={number}` - Limit results
- `offset={number}` - Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Kenyan Wildlife T-Shirt",
    "description": "Beautiful wildlife design",
    "price": 1500.00,
    "image_url": "https://...",
    "images": ["https://..."],
    "category_id": "uuid",
    "artist_id": "uuid",
    "is_active": true,
    "is_featured": true,
    "stock_quantity": 50,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Product Details
```http
GET /rest/v1/products?id=eq.{product_id}&select=*,artist:profiles(*),category:categories(*)
```

### Create Product (Artists Only)
```http
POST /rest/v1/products
Content-Type: application/json

{
  "title": "New Design T-Shirt",
  "description": "Amazing new design",
  "price": 2000.00,
  "image_url": "https://...",
  "images": ["https://..."],
  "category_id": "uuid",
  "artist_id": "uuid",
  "stock_quantity": 100
}
```

### Update Product
```http
PATCH /rest/v1/products?id=eq.{product_id}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 2500.00,
  "stock_quantity": 75
}
```

### Delete Product
```http
DELETE /rest/v1/products?id=eq.{product_id}
```

## 📦 Order Management

### Create Order
```http
POST /rest/v1/orders
Content-Type: application/json

{
  "user_id": "uuid",
  "order_number": "ORD-2024-001",
  "total_amount": 3500.00,
  "shipping_address": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "Nairobi",
    "postal_code": "00100",
    "country": "Kenya"
  },
  "payment_method": "instapay"
}
```

### Add Order Items
```http
POST /rest/v1/order_items
Content-Type: application/json

{
  "order_id": "uuid",
  "product_id": "uuid",
  "quantity": 2,
  "price": 1500.00,
  "customization": {
    "size": "L",
    "color": "blue"
  }
}
```

### Get User Orders
```http
GET /rest/v1/orders?user_id=eq.{user_id}&order=created_at.desc
```

### Update Order Status (Admin Only)
```http
PATCH /rest/v1/orders?id=eq.{order_id}
Content-Type: application/json

{
  "status": "shipped",
  "tracking_number": "TRK123456789"
}
```

## 🛒 Shopping Cart

### Get Cart Items
```http
GET /rest/v1/cart_items?user_id=eq.{user_id}&select=*,product:products(*)
```

### Add to Cart
```http
POST /rest/v1/cart_items
Content-Type: application/json

{
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 1,
  "customization": {
    "size": "M",
    "color": "red"
  }
}
```

### Update Cart Item
```http
PATCH /rest/v1/cart_items?id=eq.{cart_item_id}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /rest/v1/cart_items?id=eq.{cart_item_id}
```

## ❤️ Favorites & Wishlist

### Get User Favorites
```http
GET /rest/v1/favorites?user_id=eq.{user_id}&select=*,product:products(*)
```

### Add to Favorites
```http
POST /rest/v1/favorites
Content-Type: application/json

{
  "user_id": "uuid",
  "product_id": "uuid"
}
```

### Remove from Favorites
```http
DELETE /rest/v1/favorites?user_id=eq.{user_id}&product_id=eq.{product_id}
```

## ⭐ Reviews & Ratings

### Get Product Reviews
```http
GET /rest/v1/reviews?product_id=eq.{product_id}&select=*,user:profiles(full_name,avatar_url)
```

### Create Review
```http
POST /rest/v1/reviews
Content-Type: application/json

{
  "product_id": "uuid",
  "user_id": "uuid",
  "rating": 5,
  "comment": "Amazing product!",
  "images": ["https://..."]
}
```

## 📊 Analytics & Statistics

### Get Platform Stats
```http
GET /rest/v1/rpc/get_platform_stats
```

**Response:**
```json
{
  "total_artists": 150,
  "total_products": 1250,
  "total_orders": 890,
  "total_revenue": 2500000.00
}
```

### Get Artist Analytics
```http
GET /rest/v1/rpc/get_artist_analytics?artist_id={uuid}
```

**Response:**
```json
{
  "total_sales": 25000.00,
  "total_orders": 45,
  "average_rating": 4.8,
  "top_products": [...],
  "monthly_earnings": [...]
}
```

## 💳 Payment Integration

### Process InstaPay Payment
```http
POST /rest/v1/rpc/process_instapay_payment
Content-Type: application/json

{
  "order_id": "uuid",
  "amount": 3500.00,
  "phone_number": "+254700000000",
  "reference": "ORD-2024-001"
}
```

### Check Payment Status
```http
GET /rest/v1/rpc/check_payment_status?transaction_id={id}
```

## 🔍 Search & Filtering

### Search Products
```http
GET /rest/v1/rpc/search_products?query=wildlife&category=t-shirts&min_price=1000&max_price=5000
```

### Get Categories
```http
GET /rest/v1/categories?order=name.asc
```

## 📱 Real-time Subscriptions

### Subscribe to Order Updates
```javascript
const subscription = supabase
  .channel('order-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Order updated:', payload)
  })
  .subscribe()
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "PGRST116",
    "message": "The result contains 0 rows",
    "details": "Results contain 0 rows, application/vnd.pgrst.object+json requires 1 row"
  }
}
```

### Common Error Codes
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `422` - Validation error
- `500` - Internal server error

## 📝 Rate Limiting

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Admin requests**: 5000 requests per hour

## 🔧 Development Tools

### Postman Collection
Import our Postman collection for easy API testing:
```
https://api.postman.com/collections/brandy-shop-api
```

### SDK Usage
```javascript
import { supabase } from './lib/supabase'

// Example: Get products
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

---

For more detailed examples and advanced usage, check our [GitHub repository](https://github.com/SK3CHI3/brandy-shop) or contact our development team.
