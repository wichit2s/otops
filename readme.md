# Software Requirement Specification (SRS)
## Online Shopping Center (OTOPS)

### 1. Introduction
#### 1.1 Purpose
The purpose of this document is to specify the software requirements for the Online Shopping Center (OTOPS). This platform acts as a multi-shop aggregator where specialized shops sell products within a single category.

#### 1.2 Scope
OTOPS allows customers to browse products from various shops, add them to a unified shopping cart, and confirm checkout. The system handles mock payments and order processing without physical logistics or real financial transactions.

#### 1.3 Definitions
- **Shop**: A vendor on the platform.
- **Category**: A classification of products (e.g., Electronics, Fashion).
- **Cart**: A temporary container for products from one or more shops.

---

### 2. Overall Description
#### 2.1 Product Perspective
OTOPS is a web-based marketplace. Unlike traditional stores, it emphasizes shop specialization: one shop = one category.

#### 2.2 User Classes and Characteristics
- **Customer**: Browses products, manages a cart, and completes checkout.
- **Shop Owner**: Manages their specific shop (limited to one category).
- **Admin**: Manages the platform, categories, and shops.

#### 2.3 Operating Environment
Web-based platform accessible via modern browsers.

#### 2.4 Design and Implementation Constraints
- **One Shop, One Category**: A shop cannot list products outside its assigned category.
- **Mock Operations**: No actual payment gateway integration or shipping carrier APIs.

---

### 3. Functional Requirements
#### 3.1 Shop and Product Management
- **FR1 (Category Constraint)**: Every shop must be assigned exactly one product category upon creation.
- **FR2 (Product Listing)**: Products added to a shop must belong to the shop's assigned category.

#### 3.2 Customer Shopping Experience
- **FR3 (Product Search/Filter)**: Customers can filter products by category or browse specific shops.
- **FR4 (Multi-Shop Cart)**: Customers can add items from different shops (and thus different categories) into a single shopping cart.
- **FR5 (Cart Management)**: Customers can view, modify quantities, or remove items from the cart.

#### 3.3 Checkout and Order Confirmation
- **FR6 (Order Summary)**: Displays items grouped by shop during checkout.
- **FR7 (Payment Confirmation)**: A mock "Confirm Payment" action that simulates a successful transaction.
- **FR8 (Order Records)**: The system records the order status as "Paid" and "Confirmed" for each involved shop.

---

### 4. Data Requirements
- **Shop Data**: Name, Description, Category ID.
- **Product Data**: Name, Description, Price, Stock, Category ID, Shop ID.
- **Order Data**: Customer ID, Total Price, Order Items (Shop, Product, Quantity).

---

### 5. Non-functional Requirements
- **Usability**: The unified cart must clearly distinguish which items belong to which shop.
- **Security**: Mock checkout must still require user authentication.
- **Scalability**: Support multiple concurrent shops and customers.

---

### 6. Verification (Mock Status)
- All "Confirm Payment" actions will transition the order state directly to "Completed".
- All delivery steps are bypassed; order status will be set to "Delivered" automatically.

---

### 7. CLI Instructions

#### 7.1 Development Environment
To run the project locally for development, you need two terminal sessions.

**Backend (Django):**

* https://www.djangoproject.com/start/
* https://www.django-rest-framework.org/tutorial/quickstart/
* https://github.com/MrBin99/django-vite

```bash
cd backend
uv add -r requirements.txt
uv run manage.py makemigrations
uv run manage.py migrate
uv run manage.py seed_data
uv run manage.py runserver
```

**Frontend (Vite/React):**

* https://vite.dev/guide/ 
* https://react.dev/learn
* https://tailwindcss.com/docs/installation/using-vite


```bash
cd frontend
npm install
npm run dev
```

#### 7.2 Deployment & Production Build
To prepare the project for deployment:

**1. Build Frontend Assets:**
```bash
cd frontend
npm run build
```

**2. Prepare Backend Static Files:**
```bash
cd backend
python manage.py collectstatic --no-input
```

**3. Database Migrations:**
```bash
cd backend
python manage.py migrate
```

