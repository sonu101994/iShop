# iShop - Full Stack Electronics E-Commerce Platform

A complete electronics shopping platform built with a real e-commerce flow in mind. The project has a customer-facing store, a protected admin panel, cart and wishlist handling, address management, order tracking, and Razorpay online payment support.

I built this project to keep the shopping experience simple for users while giving the admin enough control to manage products, categories, brands, orders, users, and store data from one place.

---

## Links

- **GitHub Repository:** `https://github.com/sonu101994`
- **Live Demo:** `https://i-shop-8k1t.vercel.app`


---

## What this project does

This is an electronics store where users can browse products, filter them, add items to cart or wishlist, place orders, and manage their profile. On the other side, the admin panel handles the store data like products, categories, brands, colors, orders, customers, and dashboard stats.

The project is not only a UI build. It includes backend APIs, MongoDB models, authentication, file upload, order creation, payment verification, and separate flows for guest and logged-in users.

---

## Main Features

### Customer Side

- Modern home page with hero section, categories, featured products, and top products
- Product listing with search, filters, sorting, and pagination
- Product detail page with image gallery, color selection, quantity control, and stock handling
- Guest cart using local storage
- Logged-in user cart synced with database
- Wishlist support for both guest and logged-in users
- Address management with add, update, delete, and default address support
- Checkout with COD and Razorpay online payment
- Order history with order status and cancel option for pending orders
- Profile page with order, address, wishlist, and cart summary

### Admin Side

- Admin login and protected admin routes
- Dashboard with revenue, orders, products, customers, and recent orders
- Category, brand, color, and product management
- Product image and multiple image upload support
- User management from admin panel
- Order management with status update flow
- Admin management with role-based access

---

## Tech Stack

### Frontend

- **Next.js App Router** - page routing and layout structure
- **React.js** - component-based UI
- **Redux Toolkit** - cart, user, and admin state management
- **Tailwind CSS** - responsive styling
- **Axios** - API requests
- **React Toastify** - user notifications
- **Lucide React / React Icons** - icons
- **React Select / React Colorful** - better admin inputs and color handling

### Backend

- **Node.js** - backend runtime
- **Express.js** - REST API server
- **MongoDB** - database
- **Mongoose** - schema and database modeling
- **JWT** - authentication for admin and users
- **Bcrypt** - password hashing
- **Express FileUpload** - image upload handling
- **Razorpay** - online payment flow
- **CORS / Dotenv** - environment and API configuration

---

## How the project is structured

```bash
project-root
│
├── client
│   └── src
│       ├── app
│       │   ├── (website-group)     # customer website pages
│       │   ├── (admin-group)       # admin panel pages
│       │   ├── (auth)              # login and register pages
│       │   ├── layout.jsx          # main app layout
│       │   └── globals.css         # global styles
│       │
│       ├── components
│       │   ├── website             # website ui components
│       │   └── admin               # admin panel components
│       │
│       ├── library
│       │   ├── api-call.js         # frontend api functions
│       │   └── helper.js           # axios, headers and image helpers
│       │
│       └── redux
│           ├── reducers            # cart, user and admin reducers
│           └── store.js
│
└── server
    ├── controllers                 # api business logic
    │── config
    ├── models                      # mongoose schemas
    ├── routers                     # api routes
    ├── middleware                  # auth middleware
    ├── public/images               # uploaded images
    ├── app.js                      # express app setup
    └── server.js                   # server start file
```

---

## How it works

### Product flow

Products are created from the admin panel with name, price, discount, stock, brand, colors, main image, and extra images. The website fetches active products through the product API and shows them with filters, sorting, search, and pagination.

### Cart flow

If the user is not logged in, cart items are saved in local storage so the user can still shop without an account. After login, cart data can be synced with the backend and stored in MongoDB.

### Wishlist flow

Wishlist works in a similar way. Guest users use browser storage, while logged-in users use the wishlist API and database records.

### Checkout flow

During checkout, the user selects an address and payment method. For COD, the order is created directly. For online payment, the backend creates a Razorpay order first. The final order is created only after Razorpay payment verification, which keeps unpaid online sessions separate from real orders.

### Order flow

Each order stores product details and shipping address as a snapshot. This means old orders remain clear even if the product price, product name, or user address changes later.

### Admin flow

The admin panel is protected with JWT and role-based middleware. Admin users can manage products, categories, brands, colors, users, and orders. The dashboard gives a quick overview of revenue and order status.

---

## Environment Variables

### Client `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ASSET_PATH=http://localhost:5000
```

### Server `.env`

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=ishop
JWT_SECRET=jwt_secret_key
RAZORPAY_KEY_ID=_razorpay_key_id
RAZORPAY_KEY_SECRET=razorpay_key_secret
```

---

## Run Locally

### 1. Clone the project

```bash
git clone add-your-github-repository-link-here
cd your-project-folder
```

### 2. Install frontend dependencies

```bash
cd client
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:3000
```

### 3. Install backend dependencies

```bash
cd server
npm install
npm run dev
```

Backend will run on:

```bash
http://localhost:5000
```

---

## API Modules Covered

- Admin authentication and admin management
- User login and register
- Category management
- Brand management
- Color management
- Product management
- Cart management
- Wishlist management
- Address management
- Order management
- Razorpay payment create, verify, and cancel flow
- Admin dashboard stats

---

## What I focused on while building this

- Keeping website and admin panel separate but connected through the same backend
- Making the cart work for both guest and logged-in users
- Saving useful order snapshots instead of depending only on live product data
- Keeping API calls centralized so frontend pages stay cleaner
- Making checkout practical with both COD and online payment
- Handling admin operations like product images, status updates, and order tracking properly
- Building a portfolio-friendly project that shows frontend, backend, database, and payment integration together

---



## Author

**Developed by:** `Bhawani Singh`

A full-stack e-commerce project built with Next.js, Node.js, Express, MongoDB, Redux Toolkit, Tailwind CSS, and Razorpay.
