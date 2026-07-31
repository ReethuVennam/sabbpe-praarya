-- ============================================
-- TABLES FOR PRAARYA FOOD & BEVERAGE
-- Run this BEFORE procedures and sample data
-- ============================================

CREATE TABLE IF NOT EXISTS customer (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mobile VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  status INT DEFAULT 1,
  meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS address (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  type VARCHAR(20) DEFAULT 'HOME',
  address_line TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS product (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  description TEXT
);

CREATE TABLE IF NOT EXISTS product_variant (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  mrp DECIMAL(12,2),
  stock INT DEFAULT 0,
  sku VARCHAR(255),
  images JSON,
  FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS category (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_category (
  product_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES product(id),
  FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS cart (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS cart_item (
  id VARCHAR(36) PRIMARY KEY,
  cart_id VARCHAR(36) NOT NULL,
  variant_id VARCHAR(36) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(12,2) NOT NULL,
  selected_size VARCHAR(50),
  selected_color VARCHAR(50),
  FOREIGN KEY (cart_id) REFERENCES cart(id),
  FOREIGN KEY (variant_id) REFERENCES product_variant(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  address_id VARCHAR(36),
  total_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'pending',
  gateway_ref VARCHAR(255),
  meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS order_item (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  variant_id VARCHAR(36) NOT NULL,
  qty INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (variant_id) REFERENCES product_variant(id)
);

CREATE TABLE IF NOT EXISTS payment (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  method VARCHAR(20),
  gateway_txn_id VARCHAR(200),
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS coupon (
  code VARCHAR(40) PRIMARY KEY,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(12,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS delivery (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  address_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS invoice (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  invoice_number VARCHAR(50),
  invoice_date TIMESTAMP,
  total_amount DECIMAL(12,2),
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS returns (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  reason VARCHAR(100),
  status VARCHAR(20) DEFAULT 'initiated',
  return_date TIMESTAMP,
  notes VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(36) PRIMARY KEY,
  return_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  gateway_txn_id VARCHAR(200),
  refund_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (return_id) REFERENCES returns(id)
);

CREATE TABLE IF NOT EXISTS email_notifications (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(64),
  email_type VARCHAR(50),
  recipient_email VARCHAR(150),
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP,
  error_message VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES customer(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);
