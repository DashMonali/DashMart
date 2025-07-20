# DashMart Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server` folder with the following variables:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/dashmart
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Set to 'production' for production environment
NODE_ENV=development
```

### 3. Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the Dashboard
3. Update the `.env` file with your Cloudinary credentials

### 4. Start Backend Server
```bash
npm run dev
```

The server will start at `http://localhost:4000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Environment Variables (Optional)
Create a `.env` file in the `client` folder if needed:

```env
VITE_API_URL=http://localhost:4000/api
VITE_CURRENCY=₹
```

### 3. Start Frontend Server
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

## Testing the Application

### 1. Test Backend APIs
Use Postman or any API testing tool:

#### User Registration
```
POST http://localhost:4000/api/user/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

#### Seller Registration
```
POST http://localhost:4000/api/seller/register
Content-Type: application/json

{
  "name": "Test Seller",
  "email": "seller@example.com",
  "password": "password123",
  "businessName": "Test Business",
  "phone": "1234567890",
  "address": {
    "street": "Test St",
    "city": "Test City",
    "state": "TS",
    "zipcode": "12345",
    "country": "IN"
  }
}
```

#### Image Upload (Seller Only)
```
POST http://localhost:4000/api/upload/single
Content-Type: multipart/form-data

Form Data:
- image: [select image file]
```

### 2. Test Frontend
1. Open `http://localhost:5173`
2. Register/Login as a user
3. Register/Login as a seller
4. Add products with image uploads
5. Test cart and order functionality

## Features Implemented

### Backend
- ✅ User authentication (register, login, logout)
- ✅ Seller authentication (register, login, logout)
- ✅ Product CRUD operations
- ✅ Cart management
- ✅ Order management
- ✅ Address management
- ✅ Cloudinary image upload and optimization
- ✅ JWT-based authentication with HTTP-only cookies

### Frontend
- ✅ User registration and login
- ✅ Seller registration and login
- ✅ Product listing and details
- ✅ Cart functionality
- ✅ Order placement and management
- ✅ Address management
- ✅ Image upload with Cloudinary
- ✅ Responsive design
- ✅ Toast notifications

## API Endpoints

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout
- `GET /api/user/profile` - Get user profile

### Seller
- `POST /api/seller/register` - Seller registration
- `POST /api/seller/login` - Seller login
- `POST /api/seller/logout` - Seller logout
- `GET /api/seller/profile` - Get seller profile
- `PUT /api/seller/profile` - Update seller profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)
- `PUT /api/products/:id/stock` - Toggle stock (seller only)
- `GET /api/products/seller/products` - Get seller products

### Upload
- `POST /api/upload/single` - Upload single image (seller only)
- `POST /api/upload/multiple` - Upload multiple images (seller only)
- `DELETE /api/upload/:publicId` - Delete image (seller only)
- `GET /api/upload/optimize` - Get optimized image URL

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart
- `GET /api/cart/count` - Get cart count

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (seller only)
- `GET /api/orders/seller/orders` - Get all orders (seller only)
- `PUT /api/orders/:id/cancel` - Cancel order

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Add address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PUT /api/addresses/:id/default` - Set default address

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Cloudinary Upload Error**
   - Verify Cloudinary credentials in `.env`
   - Check if image file is valid (JPG, PNG, etc.)

3. **CORS Error**
   - Ensure frontend URL is in allowed origins
   - Check if both servers are running

4. **Authentication Error**
   - Clear browser cookies
   - Check JWT secret in `.env`

### Development Tips

1. **Use Postman Collections**
   - Import the provided API examples
   - Save requests for easy testing

2. **Monitor Console Logs**
   - Check both frontend and backend console
   - Look for error messages

3. **Test Image Upload**
   - Start with small images (< 5MB)
   - Use common formats (JPG, PNG)

## Next Steps

Potential enhancements:
- Payment gateway integration
- Email notifications
- Advanced search and filtering
- Product reviews and ratings
- Admin dashboard
- Analytics and reporting
- Mobile app development
