# FOOM Lab Backend - Purchase Request Management System

A RESTful API built with Express.js and PostgreSQL for managing purchase requests, inventory, and vendor integrations.

## 🚀 Tech Stack

- **Node.js** with **ES Modules** (ECMAScript modules)
- **Express.js** - REST API framework
- **Sequelize ORM** - Database management
- **PostgreSQL** - Database
- **Axios** - HTTP client for external API integration

## 🛠️ Quick Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create database**
```bash
createdb foomlab_dev
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=foomlab_dev
DB_DIALECT=postgres
FOOM_SECRET_KEY=your_foom_secret_key
PORT=3000
NODE_ENV=development
```

5. **Run migrations**
```bash
npx sequelize-cli db:migrate
```

6. **Start the server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

### Stocks
- `GET /api/stocks` - Get all stock records
- `GET /api/stocks/:id` - Get stock by ID
- `POST /api/stocks` - Create stock record
- `PUT /api/stocks/:id` - Update stock
- `DELETE /api/stocks/:id` - Delete stock

### Purchase Requests
- `GET /api/purchase-requests` - Get all purchase requests
- `GET /api/purchase-requests/:id` - Get purchase request by ID
- `POST /api/purchase-requests` - Create purchase request
- `PUT /api/purchase-requests/:id` - Update purchase request
- `DELETE /api/purchase-requests/:id` - Delete purchase request (DRAFT only)

### Webhook
- `POST /api/webhook/receive-stock` - Receive stock from vendor

## 📝 Usage Examples

### 1. Create Purchase Request

**Request:**
```bash
POST /api/purchase-requests
Content-Type: application/json

{
  "reference": "PR00001",
  "warehouse_id": 1,
  "products": [
    {"product_id": 1, "quantity": 10},
    {"product_id": 2, "quantity": 20}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseRequest": {
      "id": 1,
      "reference": "PR00001",
      "warehouse_id": 1,
      "status": "DRAFT",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    "items": [...]
  }
}
```

### 2. Update to PENDING (Triggers FOOM Hub API)

**Request:**
```bash
PUT /api/purchase-requests/1
Content-Type: application/json

{
  "status": "PENDING"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "PR00001",
    "warehouse_id": 1,
    "status": "PENDING"
  },
  "foomHubResponse": {
    "status": "success",
    "message": "Purchase request received"
  }
}
```

### 3. Receive Stock (Webhook)

**Request:**
```bash
POST /api/webhook/receive-stock
Content-Type: application/json

{
  "vendor": "PT FOOM LAB GLOBAL",
  "reference": "PR00001",
  "qty_total": 30,
  "details": [
    {
      "product_name": "ICY MINT",
      "sku_barcode": "ICYMINT",
      "qty": 10
    },
    {
      "product_name": "ICY WATERMELON",
      "sku_barcode": "ICYWATERMELON",
      "qty": 20
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock received and processed successfully",
  "data": {
    "purchase_request_id": 1,
    "reference": "PR00001",
    "warehouse_id": 1,
    "items_processed": 2,
    "stock_updates": [
      {
        "product_id": 1,
        "product_name": "ICY MINT",
        "sku_barcode": "ICYMINT",
        "quantity_added": 10,
        "new_stock_level": 110
      }
    ]
  }
}
```

## 🔄 Purchase Request Workflow
```
DRAFT → PENDING → COMPLETED
```

1. **DRAFT**: Initial status when created
2. **PENDING**: Set when ready to send to vendor (triggers FOOM Hub API call)
3. **COMPLETED**: Set automatically when stock is received via webhook

### Business Rules:
- Can only update purchase requests with status DRAFT
- Setting status to PENDING sends data to FOOM Hub
- Webhook looks up purchase request by reference and uses its warehouse_id
- Webhook implements idempotency - won't process if already COMPLETED
- Can only delete purchase requests with status DRAFT

## 🧪 Quick Test
```bash
# 1. Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "ICY MINT", "sku": "ICYMINT"}'

# 2. Create a warehouse
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d '{"name": "Warehouse A", "location": "Jakarta"}'

# 3. Create a purchase request
curl -X POST http://localhost:3000/api/purchase-requests \
  -H "Content-Type: application/json" \
  -d '{"reference":"PR00001","warehouse_id":1,"products":[{"product_id":1,"quantity":10}]}'

# 4. Update to PENDING
curl -X PUT http://localhost:3000/api/purchase-requests/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"PENDING"}'

# 5. Simulate webhook
curl -X POST http://localhost:3000/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{"vendor":"PT FOOM LAB GLOBAL","reference":"PR00001","qty_total":10,"details":[{"product_name":"ICY MINT","sku_barcode":"ICYMINT","qty":10}]}'
```

## 🔐 Environment Variables

Create a `.env` file with:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=
DB_NAME=foomlab_dev
DB_DIALECT=postgres

# API Configuration
FOOM_SECRET_KEY=
PORT=3000

# Environment
NODE_ENV=development
```

## 📚 Key Features

✅ **ES Modules** - Modern JavaScript with `import/export`  
✅ **Database Transactions** - Ensures data consistency  
✅ **Idempotency** - Prevents duplicate webhook processing  
✅ **External API Integration** - FOOM Hub connection  
✅ **Status Workflow** - DRAFT → PENDING → COMPLETED  
✅ **Warehouse Lookup** - Webhook uses PR reference to find warehouse  

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env or kill the process
lsof -ti:3000 | xargs kill
```

**Database connection error:**
```bash
# Ensure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

**Migration errors:**
```bash
# Reset database
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

## 📄 Project Structure
```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── migrations/       # Database migrations
│   └── config/           # Configuration files
├── server.js             # Entry point
├── package.json
└── .env
```

---

**Built for FOOM Lab Technical Assessment**  
*Demonstrating REST API, Database Management, and External API Integration with ES Modules*