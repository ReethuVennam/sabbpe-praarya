-- ============================================
-- ALL-IN-ONE: Tables + Procedures + Data
-- For MariaDB - uses DELIMITER properly
-- ============================================

-- TABLES
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_item (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  variant_id VARCHAR(36) NOT NULL,
  qty INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
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

CREATE TABLE IF NOT EXISTS address (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  type VARCHAR(20) DEFAULT 'HOME',
  address_line TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, product_id)
);

-- STORED PROCEDURES (with DELIMITER)
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_products $$
CREATE PROCEDURE sp_get_products()
BEGIN
  SELECT p.id AS product_id,
         p.name,
         p.brand,
         p.description,
         MIN(v.price) AS price,
         MIN(v.mrp) AS mrp,
         SUM(v.stock) AS stock
  FROM product p
  JOIN product_variant v ON v.product_id = p.id
  GROUP BY p.id, p.name, p.brand, p.description
  ORDER BY p.name;
END $$

DROP PROCEDURE IF EXISTS sp_get_product $$
CREATE PROCEDURE sp_get_product(IN p_product_id VARCHAR(36))
BEGIN
  SELECT p.id AS product_id,
         p.name,
         p.brand,
         p.description,
         v.price,
         v.mrp,
         v.stock,
         v.sku,
         CASE
           WHEN v.images IS NULL OR v.images = '' THEN NULL
           ELSE JSON_UNQUOTE(JSON_EXTRACT(v.images, '$[0]'))
         END AS image_url
  FROM product p
  JOIN product_variant v ON v.product_id = p.id
  WHERE p.id = p_product_id
  ORDER BY v.price
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_search_products $$
CREATE PROCEDURE sp_search_products(IN p_keyword VARCHAR(255))
BEGIN
  SELECT p.id AS product_id,
         p.name,
         p.brand,
         p.description,
         MIN(v.price) AS price,
         MIN(v.mrp) AS mrp,
         SUM(v.stock) AS stock
  FROM product p
  JOIN product_variant v ON v.product_id = p.id
  WHERE p.name LIKE CONCAT('%', p_keyword, '%')
     OR p.description LIKE CONCAT('%', p_keyword, '%')
  GROUP BY p.id, p.name, p.brand, p.description
  ORDER BY p.name;
END $$

DROP PROCEDURE IF EXISTS sp_add_to_cart $$
CREATE PROCEDURE sp_add_to_cart(
  IN p_customer_id VARCHAR(36),
  IN p_product_id VARCHAR(36),
  IN p_variant_id VARCHAR(36),
  IN p_quantity INT
)
BEGIN
  DECLARE v_cart_id VARCHAR(36);
  DECLARE v_variant VARCHAR(36);
  DECLARE v_price DECIMAL(12,2);

  SELECT id INTO v_cart_id FROM cart WHERE customer_id = p_customer_id AND status = 'active' LIMIT 1;

  IF v_cart_id IS NULL THEN
    SET v_cart_id = UUID();
    INSERT INTO cart (id, customer_id, status) VALUES (v_cart_id, p_customer_id, 'active');
  END IF;

  IF p_variant_id IS NULL OR p_variant_id = '' THEN
    SELECT id, price INTO v_variant, v_price FROM product_variant WHERE product_id = p_product_id ORDER BY price LIMIT 1;
  ELSE
    SELECT id, price INTO v_variant, v_price FROM product_variant WHERE id = p_variant_id;
  END IF;

  INSERT INTO cart_item (id, cart_id, variant_id, qty, price) VALUES (UUID(), v_cart_id, v_variant, p_quantity, v_price);
END $$

DROP PROCEDURE IF EXISTS sp_get_cart $$
CREATE PROCEDURE sp_get_cart(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT ci.id AS cart_item_id,
         ci.variant_id,
         ci.qty,
         ci.price,
         p.name AS product_name,
         p.description,
         CASE
           WHEN pv.images IS NULL OR pv.images = '' THEN NULL
           ELSE JSON_UNQUOTE(JSON_EXTRACT(pv.images, '$[0]'))
         END AS image_url
  FROM cart_item ci
  JOIN cart c ON c.id = ci.cart_id
  JOIN product_variant pv ON pv.id = ci.variant_id
  JOIN product p ON p.id = pv.product_id
  WHERE c.customer_id = p_customer_id AND c.status = 'active';
END $$

DROP PROCEDURE IF EXISTS sp_update_cart_item $$
CREATE PROCEDURE sp_update_cart_item(
  IN p_cart_item_id VARCHAR(36),
  IN p_quantity INT,
  IN p_actor_id VARCHAR(36)
)
BEGIN
  UPDATE cart_item SET qty = p_quantity WHERE id = p_cart_item_id;
END $$

DROP PROCEDURE IF EXISTS sp_remove_cart_item $$
CREATE PROCEDURE sp_remove_cart_item(
  IN p_cart_item_id VARCHAR(36),
  IN p_actor_id VARCHAR(36)
)
BEGIN
  DELETE FROM cart_item WHERE id = p_cart_item_id;
END $$

DROP PROCEDURE IF EXISTS sp_create_order $$
CREATE PROCEDURE sp_create_order(
  IN p_customer_id VARCHAR(36),
  IN p_address_id VARCHAR(36),
  IN p_coupon_code VARCHAR(40),
  IN p_payment_method VARCHAR(20),
  IN p_gateway_ref VARCHAR(255)
)
BEGIN
  DECLARE v_order_id VARCHAR(64);
  SET v_order_id = CONCAT('ORD-', UUID());
  INSERT INTO orders (id, customer_id, address_id, status, payment_status, gateway_ref, meta)
  VALUES (v_order_id, p_customer_id, p_address_id, 'pending', 'pending', COALESCE(p_gateway_ref, ''), JSON_OBJECT('coupon', p_coupon_code, 'paymentMethod', p_payment_method));
  SELECT v_order_id AS order_id;
END $$

DROP PROCEDURE IF EXISTS sp_get_orders $$
CREATE PROCEDURE sp_get_orders(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT id AS order_id, total_amount, status, payment_status, created_at
  FROM orders WHERE customer_id = p_customer_id ORDER BY created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_get_order_detail $$
CREATE PROCEDURE sp_get_order_detail(IN p_order_id VARCHAR(64))
BEGIN
  SELECT o.id AS order_id, o.total_amount, o.status, o.payment_status, o.created_at,
         oi.id AS order_item_id, oi.variant_id, oi.qty, oi.price, oi.total,
         p.name AS product_name
  FROM orders o
  LEFT JOIN order_item oi ON oi.order_id = o.id
  LEFT JOIN product_variant pv ON pv.id = oi.variant_id
  LEFT JOIN product p ON p.id = pv.product_id
  WHERE o.id = p_order_id;
END $$

DROP PROCEDURE IF EXISTS sp_fetch_user_by_email $$
CREATE PROCEDURE sp_fetch_user_by_email(IN p_email VARCHAR(150))
BEGIN
  SELECT id, name, email, mobile, password_hash, status FROM customer WHERE email = p_email LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_register_user $$
CREATE PROCEDURE sp_register_user(
  IN p_name VARCHAR(150),
  IN p_email VARCHAR(150),
  IN p_password VARCHAR(255),
  IN p_phone VARCHAR(15)
)
BEGIN
  DECLARE v_id VARCHAR(36);
  SET v_id = UUID();
  INSERT INTO customer (id, name, email, password_hash, mobile, status) VALUES (v_id, p_name, p_email, p_password, p_phone, 1);
  SELECT v_id AS customer_id;
END $$

DROP PROCEDURE IF EXISTS sp_get_profile $$
CREATE PROCEDURE sp_get_profile(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT id, name, email, mobile, status FROM customer WHERE id = p_customer_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_profile $$
CREATE PROCEDURE sp_update_profile(
  IN p_customer_id VARCHAR(36),
  IN p_name VARCHAR(150),
  IN p_email VARCHAR(150),
  IN p_mobile VARCHAR(15)
)
BEGIN
  UPDATE customer SET name = p_name, email = p_email, mobile = p_mobile WHERE id = p_customer_id;
END $$

DROP PROCEDURE IF EXISTS sp_add_address $$
CREATE PROCEDURE sp_add_address(
  IN p_customer_id VARCHAR(36),
  IN p_type VARCHAR(20),
  IN p_address_line TEXT,
  IN p_city VARCHAR(100),
  IN p_state VARCHAR(100),
  IN p_pincode VARCHAR(10),
  IN p_is_default BOOLEAN
)
BEGIN
  DECLARE v_id VARCHAR(36);
  SET v_id = UUID();
  IF p_is_default THEN UPDATE address SET is_default = FALSE WHERE customer_id = p_customer_id; END IF;
  INSERT INTO address (id, customer_id, type, address_line, city, state, pincode, is_default) VALUES (v_id, p_customer_id, p_type, p_address_line, p_city, p_state, p_pincode, p_is_default);
END $$

DROP PROCEDURE IF EXISTS sp_get_addresses $$
CREATE PROCEDURE sp_get_addresses(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT id, type, address_line, city, state, pincode, is_default FROM address WHERE customer_id = p_customer_id ORDER BY is_default DESC;
END $$

DROP PROCEDURE IF EXISTS sp_validate_coupon $$
CREATE PROCEDURE sp_validate_coupon(
  IN p_customer_id VARCHAR(36),
  IN p_coupon_code VARCHAR(40),
  IN p_order_amount DECIMAL(12,2)
)
BEGIN
  SELECT code, discount_type, discount_value FROM coupon WHERE code = p_coupon_code AND active = TRUE AND min_order_amount <= p_order_amount LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_toggle_wishlist $$
CREATE PROCEDURE sp_toggle_wishlist(
  IN p_user_id VARCHAR(36),
  IN p_product_id VARCHAR(36)
)
BEGIN
  IF EXISTS (SELECT 1 FROM wishlist WHERE user_id = p_user_id AND product_id = p_product_id) THEN
    DELETE FROM wishlist WHERE user_id = p_user_id AND product_id = p_product_id;
  ELSE
    INSERT INTO wishlist (user_id, product_id) VALUES (p_user_id, p_product_id);
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_fetch_wishlist $$
CREATE PROCEDURE sp_fetch_wishlist(IN p_user_id VARCHAR(36))
BEGIN
  SELECT p.id, p.name, p.brand, p.description, MIN(v.price) AS price
  FROM wishlist w
  JOIN product p ON p.id = w.product_id
  JOIN product_variant v ON v.product_id = p.id
  WHERE w.user_id = p_user_id
  GROUP BY p.id, p.name, p.brand, p.description;
END $$

DELIMITER ;

-- SAMPLE DATA
INSERT IGNORE INTO category (id, name) VALUES
('cat-001', 'Soft Drinks'), ('cat-002', 'Fresh Juices'), ('cat-003', 'Coffee & Tea'),
('cat-004', 'Energy Drinks'), ('cat-005', 'Snacks'), ('cat-006', 'Desserts');

INSERT IGNORE INTO product (id, name, brand, description) VALUES
('prod-001', 'Citrus Sparkle', 'Praarya', 'Sparkling citrus with a hint of mint'),
('prod-002', 'Sunrise Press', 'Praarya', 'Cold-pressed orange and berry blend'),
('prod-003', 'Velvet Latte', 'Praarya', 'Silky microfoam over double espresso'),
('prod-004', 'Mango Tango', 'Praarya', 'Fresh mango puree with a tropical twist'),
('prod-005', 'Berry Bliss', 'Praarya', 'Mixed berry smoothie with Greek yogurt'),
('prod-006', 'Classic Cola', 'Praarya', 'Refreshing cola with natural flavors'),
('prod-007', 'Mint Lift Can', 'Praarya', 'Natural caffeine, light sparkle'),
('prod-008', 'Iced Americano', 'Praarya', 'Double-shot espresso over ice'),
('prod-009', 'Green Detox', 'Praarya', 'Spinach, apple and ginger cold-pressed juice'),
('prod-010', 'Lemon Fizz', 'Praarya', 'Sparkling lemonade with fresh mint'),
('prod-011', 'Golden Crisps', 'Praarya', 'Kettle-cooked, sea salt finish'),
('prod-012', 'Berry Tart', 'Praarya', 'Buttery shell, fresh seasonal berries'),
('prod-013', 'Nut Mix', 'Praarya', 'Premium roasted almonds and cashews'),
('prod-014', 'Cheese Crostini', 'Praarya', 'Crispy bread topped with aged cheese'),
('prod-015', 'Chocolate Truffle', 'Praarya', 'Rich dark chocolate ganache center');

INSERT IGNORE INTO product_variant (id, product_id, price, mrp, stock, sku, images) VALUES
('var-001', 'prod-001', 4.50, 5.00, 100, 'SKU-CS-001', '["https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400"]'),
('var-002', 'prod-002', 5.20, 6.00, 80, 'SKU-SP-002', '["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400"]'),
('var-003', 'prod-003', 4.80, 5.50, 60, 'SKU-VL-003', '["https://images.unsplash.com/photo-1534778101976-62847782c213?w=400"]'),
('var-004', 'prod-004', 5.00, 6.00, 90, 'SKU-MT-004', '["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400"]'),
('var-005', 'prod-005', 5.50, 6.50, 70, 'SKU-BB-005', '["https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400"]'),
('var-006', 'prod-006', 2.50, 3.00, 200, 'SKU-CC-006', '["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400"]'),
('var-007', 'prod-007', 3.90, 4.50, 150, 'SKU-ML-007', '["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400"]'),
('var-008', 'prod-008', 4.20, 5.00, 80, 'SKU-IA-008', '["https://images.unsplash.com/photo-1534778101976-62847782c213?w=400"]'),
('var-009', 'prod-009', 6.00, 7.00, 50, 'SKU-GD-009', '["https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400"]'),
('var-010', 'prod-010', 3.50, 4.00, 120, 'SKU-LF-010', '["https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400"]'),
('var-011', 'prod-011', 3.20, 3.80, 200, 'SKU-GC-011', '["https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"]'),
('var-012', 'prod-012', 5.60, 6.50, 40, 'SKU-BT-012', '["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400"]'),
('var-013', 'prod-013', 4.50, 5.00, 100, 'SKU-NM-013', '["https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"]'),
('var-014', 'prod-014', 5.00, 5.80, 60, 'SKU-CC-014', '["https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"]'),
('var-015', 'prod-015', 6.50, 7.50, 30, 'SKU-CT-015', '["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400"]');

INSERT IGNORE INTO product_category (product_id, category_id) VALUES
('prod-001', 'cat-001'), ('prod-002', 'cat-002'), ('prod-003', 'cat-003'),
('prod-004', 'cat-002'), ('prod-005', 'cat-002'), ('prod-006', 'cat-001'),
('prod-007', 'cat-004'), ('prod-008', 'cat-003'), ('prod-009', 'cat-002'),
('prod-010', 'cat-001'), ('prod-011', 'cat-005'), ('prod-012', 'cat-006'),
('prod-013', 'cat-005'), ('prod-014', 'cat-005'), ('prod-015', 'cat-006');

INSERT IGNORE INTO coupon (id, code, discount_type, discount_value, rules, start_date, end_date) VALUES
(UUID(), 'WELCOME10', 'percent', 10.00, '{"min_order": 10}', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
(UUID(), 'FLAT5', 'flat', 5.00, '{"min_order": 20}', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
(UUID(), 'SAVE20', 'percent', 20.00, '{"min_order": 50}', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
