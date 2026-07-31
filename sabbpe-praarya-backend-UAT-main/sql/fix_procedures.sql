-- Fix all stored procedures to match Java code column names
-- Run this ONE file in MariaDB

DELIMITER $$

-- 1. sp_get_products: Java reads image_url column
DROP PROCEDURE IF EXISTS sp_get_products $$
CREATE PROCEDURE sp_get_products()
BEGIN
  SELECT p.id AS product_id,
         p.name,
         p.brand,
         p.description,
         MIN(v.price) AS price,
         MIN(v.mrp) AS mrp,
         SUM(v.stock) AS stock,
         JSON_UNQUOTE(JSON_EXTRACT(MIN(v.images), '$[0]')) AS image_url
  FROM product p
  JOIN product_variant v ON v.product_id = p.id
  GROUP BY p.id, p.name, p.brand, p.description
  ORDER BY p.name;
END $$

-- 2. sp_add_to_cart: Java reads cart_item_id, customer_id, product_id, variant_id, product_name, quantity, unit_price, line_total
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
  DECLARE v_item_id VARCHAR(36);

  SELECT id INTO v_cart_id FROM cart WHERE customer_id = p_customer_id AND status = 'active' LIMIT 1;
  IF v_cart_id IS NULL THEN
    SET v_cart_id = UUID();
    INSERT INTO cart (id, customer_id, status) VALUES (v_cart_id, p_customer_id, 'active');
  END IF;

  IF p_variant_id IS NOT NULL AND p_variant_id != '' THEN
    SELECT id, price INTO v_variant, v_price FROM product_variant WHERE id = p_variant_id LIMIT 1;
  END IF;

  IF v_variant IS NULL THEN
    SELECT id, price INTO v_variant, v_price FROM product_variant WHERE product_id = p_product_id ORDER BY price LIMIT 1;
  END IF;

  SET v_item_id = UUID();
  INSERT INTO cart_item (id, cart_id, variant_id, qty, price) VALUES (v_item_id, v_cart_id, v_variant, p_quantity, v_price);

  SELECT ci.id AS cart_item_id,
         ci.cart_id AS customer_id,
         pv.product_id,
         ci.variant_id,
         p.name AS product_name,
         ci.qty AS quantity,
         ci.price AS unit_price,
         (ci.price * ci.qty) AS line_total
  FROM cart_item ci
  JOIN product_variant pv ON pv.id = ci.variant_id
  JOIN product p ON p.id = pv.product_id
  WHERE ci.id = v_item_id;
END $$

-- 3. sp_get_cart: Java reads cart_item_id, customer_id, product_id, variant_id, product_name, quantity, unit_price, line_total
DROP PROCEDURE IF EXISTS sp_get_cart $$
CREATE PROCEDURE sp_get_cart(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT ci.id AS cart_item_id,
         ci.cart_id AS customer_id,
         pv.product_id,
         ci.variant_id,
         p.name AS product_name,
         ci.qty AS quantity,
         ci.price AS unit_price,
         (ci.price * ci.qty) AS line_total
  FROM cart_item ci
  JOIN cart c ON c.id = ci.cart_id
  JOIN product_variant pv ON pv.id = ci.variant_id
  JOIN product p ON p.id = pv.product_id
  WHERE c.customer_id = p_customer_id AND c.status = 'active';
END $$

-- 4. sp_fetch_user_by_email: Java reads id, name, email, PASSWORD, phone
DROP PROCEDURE IF EXISTS sp_fetch_user_by_email $$
CREATE PROCEDURE sp_fetch_user_by_email(IN p_email VARCHAR(150))
BEGIN
  SELECT id, name, email, password_hash AS password, mobile AS phone
  FROM customer
  WHERE LOWER(email) = LOWER(p_email)
  LIMIT 1;
END $$

-- 5. sp_fetch_user_profile: Java reads id, name, email, phone
DROP PROCEDURE IF EXISTS sp_fetch_user_profile $$
CREATE PROCEDURE sp_fetch_user_profile(IN p_user_id VARCHAR(36))
BEGIN
  SELECT id, name, email, mobile AS phone
  FROM customer
  WHERE id = p_user_id;
END $$

-- 6. sp_register_user: Java expects single column result (user_id string)
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
  SELECT v_id AS user_id;
END $$

-- 7. sp_update_user_profile: Java expects single column result (user_id string)
DROP PROCEDURE IF EXISTS sp_update_user_profile $$
CREATE PROCEDURE sp_update_user_profile(
  IN p_user_id VARCHAR(36),
  IN p_name VARCHAR(150),
  IN p_email VARCHAR(150),
  IN p_phone VARCHAR(15),
  IN p_address VARCHAR(500),
  IN p_avatar VARCHAR(10)
)
BEGIN
  UPDATE customer SET name = p_name, email = p_email, mobile = p_phone WHERE id = p_user_id;
  SELECT p_user_id AS user_id;
END $$

-- 8. sp_update_cart_item
DROP PROCEDURE IF EXISTS sp_update_cart_item $$
CREATE PROCEDURE sp_update_cart_item(
  IN p_cart_item_id VARCHAR(36),
  IN p_quantity INT,
  IN p_actor_id VARCHAR(36)
)
BEGIN
  UPDATE cart_item SET qty = p_quantity WHERE id = p_cart_item_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

-- 9. sp_remove_cart_item
DROP PROCEDURE IF EXISTS sp_remove_cart_item $$
CREATE PROCEDURE sp_remove_cart_item(
  IN p_cart_item_id VARCHAR(36),
  IN p_actor_id VARCHAR(36)
)
BEGIN
  DELETE FROM cart_item WHERE id = p_cart_item_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

-- 10. sp_search_products: Java reads image_url column
DROP PROCEDURE IF EXISTS sp_search_products $$
CREATE PROCEDURE sp_search_products(IN p_keyword VARCHAR(255))
BEGIN
  SELECT p.id AS product_id,
         p.name,
         p.brand,
         p.description,
         MIN(v.price) AS price,
         MIN(v.mrp) AS mrp,
         SUM(v.stock) AS stock,
         JSON_UNQUOTE(JSON_EXTRACT(MIN(v.images), '$[0]')) AS image_url
  FROM product p
  JOIN product_variant v ON v.product_id = p.id
  WHERE p.name LIKE CONCAT('%', p_keyword, '%')
     OR p.description LIKE CONCAT('%', p_keyword, '%')
  GROUP BY p.id, p.name, p.brand, p.description
  ORDER BY p.name;
END $$

DELIMITER ;
