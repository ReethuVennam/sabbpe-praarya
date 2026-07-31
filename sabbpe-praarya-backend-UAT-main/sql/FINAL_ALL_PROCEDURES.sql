-- ============================================
-- COMPLETE STORED PROCEDURES FOR PRAARYA
-- Every column label matches Java code EXACTLY
-- ============================================

DELIMITER $$

-- ===================== PRODUCTS =====================
DROP PROCEDURE IF EXISTS sp_get_products $$
CREATE PROCEDURE sp_get_products()
BEGIN
  SELECT p.id AS product_id, p.name, p.brand, p.description,
         MIN(v.price) AS price, MIN(v.mrp) AS mrp, SUM(v.stock) AS stock,
         JSON_UNQUOTE(JSON_EXTRACT(MIN(v.images), '$[0]')) AS image_url
  FROM product p JOIN product_variant v ON v.product_id = p.id
  GROUP BY p.id, p.name, p.brand, p.description ORDER BY p.name;
END $$

DROP PROCEDURE IF EXISTS sp_get_product $$
CREATE PROCEDURE sp_get_product(IN p_id VARCHAR(36))
BEGIN
  SELECT p.id AS product_id, p.name, p.brand, p.description,
         v.price, v.mrp, v.stock, v.sku,
         JSON_UNQUOTE(JSON_EXTRACT(v.images, '$[0]')) AS image_url
  FROM product p JOIN product_variant v ON v.product_id = p.id
  WHERE p.id = p_id ORDER BY v.price LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_search_products $$
CREATE PROCEDURE sp_search_products(IN p_keyword VARCHAR(255))
BEGIN
  SELECT p.id AS product_id, p.name, p.brand, p.description,
         MIN(v.price) AS price, MIN(v.mrp) AS mrp, SUM(v.stock) AS stock,
         JSON_UNQUOTE(JSON_EXTRACT(MIN(v.images), '$[0]')) AS image_url
  FROM product p JOIN product_variant v ON v.product_id = p.id
  WHERE p.name LIKE CONCAT('%', p_keyword, '%') OR p.description LIKE CONCAT('%', p_keyword, '%')
  GROUP BY p.id, p.name, p.brand, p.description ORDER BY p.name;
END $$

-- ===================== CART (Fintech) =====================
DROP PROCEDURE IF EXISTS sp_add_to_cart $$
CREATE PROCEDURE sp_add_to_cart(IN p_cid VARCHAR(36), IN p_pid VARCHAR(36), IN p_vid VARCHAR(36), IN p_qty INT)
BEGIN
  DECLARE v_cart VARCHAR(36); DECLARE v_variant VARCHAR(36); DECLARE v_price DECIMAL(12,2);
  SELECT id INTO v_cart FROM cart WHERE customer_id = p_cid AND status = 'active' LIMIT 1;
  IF v_cart IS NULL THEN SET v_cart = UUID(); INSERT INTO cart (id, customer_id, status) VALUES (v_cart, p_cid, 'active'); END IF;
  IF p_vid IS NOT NULL AND p_vid != '' THEN SELECT id, price INTO v_variant, v_price FROM product_variant WHERE id = p_vid LIMIT 1; END IF;
  IF v_variant IS NULL THEN SELECT id, price INTO v_variant, v_price FROM product_variant WHERE product_id = p_pid ORDER BY price LIMIT 1; END IF;
  INSERT INTO cart_item (id, cart_id, variant_id, qty, price) VALUES (UUID(), v_cart, v_variant, p_qty, v_price);
  SELECT ci.id AS cart_item_id, c.customer_id, pv.product_id, ci.variant_id, p.name AS product_name,
         ci.qty AS quantity, ci.price AS unit_price, (ci.price * ci.qty) AS line_total
  FROM cart_item ci JOIN cart c ON c.id = ci.cart_id JOIN product_variant pv ON pv.id = ci.variant_id
  JOIN product p ON p.id = pv.product_id WHERE ci.id = (SELECT MAX(id) FROM cart_item WHERE cart_id = v_cart);
END $$

DROP PROCEDURE IF EXISTS sp_get_cart $$
CREATE PROCEDURE sp_get_cart(IN p_cid VARCHAR(36))
BEGIN
  SELECT ci.id AS cart_item_id, c.customer_id, pv.product_id, ci.variant_id,
         p.name AS product_name, ci.qty AS quantity, ci.price AS unit_price,
         (ci.price * ci.qty) AS line_total
  FROM cart_item ci JOIN cart c ON c.id = ci.cart_id JOIN product_variant pv ON pv.id = ci.variant_id
  JOIN product p ON p.id = pv.product_id WHERE c.customer_id = p_cid AND c.status = 'active';
END $$

DROP PROCEDURE IF EXISTS sp_update_cart_item $$
CREATE PROCEDURE sp_update_cart_item(IN p_id VARCHAR(36), IN p_qty INT, IN p_actor VARCHAR(36))
BEGIN UPDATE cart_item SET qty = p_qty WHERE id = p_id; SELECT ROW_COUNT() AS affected_rows; END $$

DROP PROCEDURE IF EXISTS sp_remove_cart_item $$
CREATE PROCEDURE sp_remove_cart_item(IN p_id VARCHAR(36), IN p_actor VARCHAR(36))
BEGIN DELETE FROM cart_item WHERE id = p_id; SELECT ROW_COUNT() AS affected_rows; END $$

-- ===================== USER / AUTH =====================
DROP PROCEDURE IF EXISTS sp_fetch_user_by_email $$
CREATE PROCEDURE sp_fetch_user_by_email(IN p_email VARCHAR(150))
BEGIN SELECT id, name, email, password_hash AS password, mobile AS phone FROM customer WHERE LOWER(email) = LOWER(p_email) LIMIT 1; END $$

DROP PROCEDURE IF EXISTS sp_fetch_user_profile $$
CREATE PROCEDURE sp_fetch_user_profile(IN p_id VARCHAR(36))
BEGIN SELECT id, name, email, mobile AS phone FROM customer WHERE id = p_id; END $$

DROP PROCEDURE IF EXISTS sp_register_user $$
CREATE PROCEDURE sp_register_user(IN p_name VARCHAR(150), IN p_email VARCHAR(150), IN p_pw VARCHAR(255), IN p_phone VARCHAR(15))
BEGIN DECLARE v_id VARCHAR(36); SET v_id = UUID();
  INSERT INTO customer (id, name, email, password_hash, mobile, status) VALUES (v_id, p_name, p_email, p_pw, p_phone, 1);
  SELECT v_id AS user_id; END $$

DROP PROCEDURE IF EXISTS sp_update_user_profile $$
CREATE PROCEDURE sp_update_user_profile(IN p_id VARCHAR(36), IN p_name VARCHAR(150), IN p_email VARCHAR(150), IN p_phone VARCHAR(15), IN p_addr VARCHAR(500), IN p_avatar VARCHAR(10))
BEGIN UPDATE customer SET name = p_name, email = p_email, mobile = p_phone WHERE id = p_id; SELECT p_id AS user_id; END $$

DROP PROCEDURE IF EXISTS sp_get_profile $$
CREATE PROCEDURE sp_get_profile(IN p_cid VARCHAR(36))
BEGIN SELECT id AS customer_id, name, email, mobile, status, CAST(created_at AS CHAR) AS created_at FROM customer WHERE id = p_cid; END $$

DROP PROCEDURE IF EXISTS sp_update_profile $$
CREATE PROCEDURE sp_update_profile(IN p_cid VARCHAR(36), IN p_name VARCHAR(150), IN p_email VARCHAR(150), IN p_mobile VARCHAR(15))
BEGIN UPDATE customer SET name = p_name, email = p_email, mobile = p_mobile WHERE id = p_cid;
  SELECT id AS customer_id, name, email, mobile, status, CAST(created_at AS CHAR) AS created_at FROM customer WHERE id = p_cid; END $$

-- ===================== ADDRESS =====================
DROP PROCEDURE IF EXISTS sp_add_address $$
CREATE PROCEDURE sp_add_address(IN p_cid VARCHAR(36), IN p_type VARCHAR(20), IN p_line TEXT, IN p_city VARCHAR(100), IN p_state VARCHAR(100), IN p_pin VARCHAR(10), IN p_def BOOLEAN)
BEGIN DECLARE v_id VARCHAR(36); SET v_id = UUID();
  IF p_def THEN UPDATE address SET is_default = FALSE WHERE customer_id = p_cid; END IF;
  INSERT INTO address (id, customer_id, type, address_line, city, state, pincode, is_default) VALUES (v_id, p_cid, p_type, p_line, p_city, p_state, p_pin, p_def);
  SELECT v_id AS address_id, p_cid AS customer_id, p_type AS type, p_line AS address_line, p_city AS city, p_state AS state, p_pin AS pincode, p_def AS is_default; END $$

DROP PROCEDURE IF EXISTS sp_get_addresses $$
CREATE PROCEDURE sp_get_addresses(IN p_cid VARCHAR(36))
BEGIN SELECT id AS address_id, customer_id, type, address_line, city, state, pincode, is_default FROM address WHERE customer_id = p_cid ORDER BY is_default DESC; END $$

-- ===================== ORDERS (Procedure layer) =====================
DROP PROCEDURE IF EXISTS sp_create_order $$
CREATE PROCEDURE sp_create_order(IN p_cid VARCHAR(36), IN p_aid VARCHAR(36), IN p_coupon VARCHAR(40), IN p_method VARCHAR(20))
BEGIN DECLARE v_id VARCHAR(64); SET v_id = CONCAT('ORD-', REPLACE(UUID(), '-', ''));
  INSERT INTO orders (id, customer_id, address_id, total_amount, status, payment_status, meta, created_at)
  VALUES (v_id, p_cid, IFNULL(p_aid, ''), 0, 'pending', 'pending', JSON_OBJECT('coupon', IFNULL(p_coupon, ''), 'paymentMethod', IFNULL(p_method, '')), CURRENT_TIMESTAMP);
  SELECT v_id AS order_id, p_cid AS customer_id, 0 AS total_amount, 'pending' AS status, 'pending' AS payment_status, CAST(CURRENT_TIMESTAMP AS CHAR) AS created_at; END $$

DROP PROCEDURE IF EXISTS sp_add_order_items $$
CREATE PROCEDURE sp_add_order_items(IN p_oid VARCHAR(64), IN p_vid VARCHAR(36), IN p_qty INT, IN p_price DECIMAL(12,2))
BEGIN
  IF EXISTS (SELECT 1 FROM product_variant WHERE id = p_vid) THEN
    INSERT INTO order_item (id, order_id, variant_id, qty, price, total) VALUES (UUID(), p_oid, p_vid, p_qty, p_price, p_price * p_qty);
    UPDATE orders SET total_amount = (SELECT COALESCE(SUM(total), 0) FROM order_item WHERE order_id = p_oid) WHERE id = p_oid;
  END IF;
  SELECT p_oid AS order_id; END $$

DROP PROCEDURE IF EXISTS sp_get_orders $$
CREATE PROCEDURE sp_get_orders(IN p_cid VARCHAR(36))
BEGIN SELECT id AS order_id, customer_id, total_amount, status, payment_status, CAST(created_at AS CHAR) AS created_at FROM orders WHERE customer_id = p_cid ORDER BY created_at DESC; END $$

DROP PROCEDURE IF EXISTS sp_get_order_detail $$
CREATE PROCEDURE sp_get_order_detail(IN p_oid VARCHAR(64))
BEGIN
  SELECT o.id AS order_id, o.customer_id, o.total_amount, o.status, o.payment_status, CAST(o.created_at AS CHAR) AS created_at
  FROM orders o WHERE o.id = p_oid;
END $$

DROP PROCEDURE IF EXISTS sp_get_order_items_for_detail $$
CREATE PROCEDURE sp_get_order_items_for_detail(IN p_oid VARCHAR(64))
BEGIN SELECT oi.id AS order_item_id, oi.variant_id, COALESCE(p.name, 'Product') AS product_name, oi.qty AS quantity, oi.price, oi.total FROM order_item oi LEFT JOIN product_variant pv ON pv.id = oi.variant_id LEFT JOIN product p ON p.id = pv.product_id WHERE oi.order_id = p_oid; END $$

-- ===================== ORDERS (StoredProcedure layer) =====================
DROP PROCEDURE IF EXISTS sp_upsert_address $$
CREATE PROCEDURE sp_upsert_address(IN p_uid VARCHAR(36), IN p_name VARCHAR(150), IN p_addr TEXT, IN p_city VARCHAR(100), IN p_state VARCHAR(100), IN p_pin VARCHAR(10), IN p_phone VARCHAR(15))
BEGIN DECLARE v_id VARCHAR(36); SET v_id = UUID();
  INSERT INTO address (id, customer_id, type, address_line, city, state, pincode, is_default) VALUES (v_id, p_uid, 'HOME', p_addr, p_city, p_state, p_pin, TRUE);
  SELECT v_id AS address_id; END $$

DROP PROCEDURE IF EXISTS sp_transfer_cart_to_order $$
CREATE PROCEDURE sp_transfer_cart_to_order(IN p_uid VARCHAR(36), IN p_oid VARCHAR(64), IN p_method VARCHAR(20))
BEGIN
  INSERT INTO order_item (id, order_id, variant_id, qty, price, total)
  SELECT UUID(), p_oid, ci.variant_id, ci.qty, ci.price, (ci.price * ci.qty)
  FROM cart_item ci JOIN cart c ON c.id = ci.cart_id WHERE c.customer_id = p_uid AND c.status = 'active';
  UPDATE orders SET total_amount = (SELECT COALESCE(SUM(total), 0) FROM order_item WHERE order_id = p_oid), payment_status = LOWER(IFNULL(p_method, 'pending')) WHERE id = p_oid;
  DELETE ci FROM cart_item ci JOIN cart c ON c.id = ci.cart_id WHERE c.customer_id = p_uid AND c.status = 'active';
  UPDATE cart SET status = 'ordered' WHERE customer_id = p_uid AND status = 'active';
  SELECT ROW_COUNT() AS affected_rows; END $$

DROP PROCEDURE IF EXISTS sp_fetch_orders $$
CREATE PROCEDURE sp_fetch_orders(IN p_uid VARCHAR(36))
BEGIN SELECT id, CAST(created_at AS DATE) AS order_date, status, total_amount AS total, COALESCE(JSON_UNQUOTE(JSON_EXTRACT(meta, '$.paymentMethod')), '') AS payment_method,
  '' AS shipping_name, '' AS shipping_address, '' AS city, '' AS state, '' AS pincode, '' AS phone, '' AS email,
  '' AS tracking_number, '' AS carrier, NULL AS estimated_delivery
  FROM orders WHERE customer_id = p_uid ORDER BY created_at DESC; END $$

DROP PROCEDURE IF EXISTS sp_fetch_order_by_id $$
CREATE PROCEDURE sp_fetch_order_by_id(IN p_oid VARCHAR(64))
BEGIN SELECT id, CAST(created_at AS DATE) AS order_date, status, total_amount AS total, COALESCE(JSON_UNQUOTE(JSON_EXTRACT(meta, '$.paymentMethod')), '') AS payment_method,
  '' AS shipping_name, '' AS shipping_address, '' AS city, '' AS state, '' AS pincode, '' AS phone, '' AS email,
  '' AS tracking_number, '' AS carrier, NULL AS estimated_delivery
  FROM orders WHERE id = p_oid; END $$

DROP PROCEDURE IF EXISTS sp_fetch_order_items $$
CREATE PROCEDURE sp_fetch_order_items(IN p_oid VARCHAR(64))
BEGIN SELECT COALESCE(p.name, 'Product') AS name, oi.price, '' AS image, '' AS color, oi.qty AS quantity FROM order_item oi LEFT JOIN product_variant pv ON pv.id = oi.variant_id LEFT JOIN product p ON p.id = pv.product_id WHERE oi.order_id = p_oid; END $$

-- ===================== PAYMENT =====================
DROP PROCEDURE IF EXISTS sp_update_order_payment_status $$
CREATE PROCEDURE sp_update_order_payment_status(IN p_oid VARCHAR(64), IN p_status VARCHAR(20), IN p_txn VARCHAR(200))
BEGIN UPDATE orders SET payment_status = LOWER(p_status) WHERE id = p_oid;
  SELECT p_oid AS order_id, payment_status FROM orders WHERE id = p_oid; END $$

DROP PROCEDURE IF EXISTS sp_create_payment $$
CREATE PROCEDURE sp_create_payment(IN p_oid VARCHAR(64), IN p_method VARCHAR(20), IN p_txn VARCHAR(200), IN p_amount DECIMAL(12,2))
BEGIN INSERT INTO payment(id, order_id, method, gateway_txn_id, amount, status, created_at) VALUES (UUID(), p_oid, p_method, p_txn, p_amount, 'pending', CURRENT_TIMESTAMP);
  SELECT id AS payment_id, order_id, status FROM payment ORDER BY created_at DESC LIMIT 1; END $$

-- ===================== COUPON =====================
DROP PROCEDURE IF EXISTS sp_validate_coupon $$
CREATE PROCEDURE sp_validate_coupon(IN p_cid VARCHAR(36), IN p_code VARCHAR(40), IN p_amount DECIMAL(12,2))
BEGIN
  DECLARE v_discount DECIMAL(12,2) DEFAULT 0;
  SELECT discount_value INTO v_discount FROM coupon WHERE LOWER(code) = LOWER(p_code) AND active = 1 LIMIT 1;
  SELECT IF(v_discount > 0, TRUE, FALSE) AS is_valid, v_discount AS discount_amount, IF(v_discount > 0, 'Coupon applied', 'Invalid coupon') AS message;
END $$

-- ===================== INVOICE =====================
DROP PROCEDURE IF EXISTS sp_create_invoice $$
CREATE PROCEDURE sp_create_invoice(IN p_oid VARCHAR(64), IN p_num VARCHAR(50), IN p_total DECIMAL(12,2), IN p_tax DECIMAL(12,2), IN p_disc DECIMAL(12,2))
BEGIN DECLARE v_id VARCHAR(36); SET v_id = UUID();
  INSERT INTO invoice(id, order_id, invoice_number, invoice_date, total_amount, tax_amount, discount_amount, status, created_at) VALUES (v_id, p_oid, p_num, CURRENT_TIMESTAMP, p_total, p_tax, p_disc, 'generated', CURRENT_TIMESTAMP);
  SELECT v_id AS invoice_id, p_oid AS order_id, CAST(CURRENT_TIMESTAMP AS CHAR) AS invoice_date, p_total AS total_amount, p_disc AS discount_amount, 'generated' AS status; END $$

DROP PROCEDURE IF EXISTS sp_get_invoice_by_order $$
CREATE PROCEDURE sp_get_invoice_by_order(IN p_oid VARCHAR(64))
BEGIN SELECT id AS invoice_id, order_id, invoice_number, CAST(invoice_date AS CHAR) AS invoice_date, total_amount, discount_amount, status FROM invoice WHERE order_id = p_oid ORDER BY invoice_date DESC LIMIT 1; END $$

-- ===================== WISHLIST =====================
DROP PROCEDURE IF EXISTS sp_fetch_wishlist $$
CREATE PROCEDURE sp_fetch_wishlist(IN p_uid VARCHAR(36))
BEGIN SELECT product_id FROM wishlist WHERE user_id = p_uid; END $$

DROP PROCEDURE IF EXISTS sp_toggle_wishlist $$
CREATE PROCEDURE sp_toggle_wishlist(IN p_uid VARCHAR(36), IN p_pid VARCHAR(36))
BEGIN IF EXISTS (SELECT 1 FROM wishlist WHERE user_id = p_uid AND product_id = p_pid) THEN DELETE FROM wishlist WHERE user_id = p_uid AND product_id = p_pid; SELECT 0 AS affected_rows;
  ELSE INSERT INTO wishlist (user_id, product_id) VALUES (p_uid, p_pid); SELECT 1 AS affected_rows; END IF; END $$

-- ===================== CATALOG =====================
DROP PROCEDURE IF EXISTS sp_fetch_categories $$
CREATE PROCEDURE sp_fetch_categories()
BEGIN SELECT c.name, COUNT(pc.product_id) AS product_count FROM category c LEFT JOIN product_category pc ON pc.category_id = c.id GROUP BY c.id, c.name; END $$

DROP PROCEDURE IF EXISTS sp_fetch_products $$
CREATE PROCEDURE sp_fetch_products(IN p_cat VARCHAR(255))
BEGIN
  IF p_cat IS NULL OR p_cat = '' THEN
    SELECT p.id, p.name, COALESCE(MIN(v.price), 0) AS price, COALESCE(c.name, '') AS category, p.description
    FROM product p LEFT JOIN product_variant v ON v.product_id = p.id LEFT JOIN product_category pc ON pc.product_id = p.id LEFT JOIN category c ON c.id = pc.category_id
    GROUP BY p.id, p.name, p.description ORDER BY p.name;
  ELSE
    SELECT p.id, p.name, COALESCE(MIN(v.price), 0) AS price, c.name AS category, p.description
    FROM product p LEFT JOIN product_variant v ON v.product_id = p.id JOIN product_category pc ON pc.product_id = p.id JOIN category c ON c.id = pc.category_id
    WHERE c.name = p_cat GROUP BY p.id, p.name, p.description ORDER BY p.name;
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_fetch_product_by_id $$
CREATE PROCEDURE sp_fetch_product_by_id(IN p_id VARCHAR(36))
BEGIN SELECT p.id, p.name, COALESCE(MIN(v.price), 0) AS price, COALESCE(c.name, '') AS category, p.description
  FROM product p LEFT JOIN product_variant v ON v.product_id = p.id LEFT JOIN product_category pc ON pc.product_id = p.id LEFT JOIN category c ON c.id = pc.category_id
  WHERE p.id = p_id GROUP BY p.id, p.name, p.description; END $$

DROP PROCEDURE IF EXISTS sp_fetch_product_images $$
CREATE PROCEDURE sp_fetch_product_images(IN p_id VARCHAR(36))
BEGIN SELECT JSON_UNQUOTE(JSON_EXTRACT(v.images, '$[0]')) AS image_url FROM product_variant v WHERE v.product_id = p_id AND v.images IS NOT NULL LIMIT 1; END $$

DROP PROCEDURE IF EXISTS sp_fetch_product_sizes $$
CREATE PROCEDURE sp_fetch_product_sizes(IN p_id VARCHAR(36))
BEGIN SELECT DISTINCT sku AS size_value FROM product_variant WHERE product_id = p_id; END $$

DROP PROCEDURE IF EXISTS sp_fetch_product_colors $$
CREATE PROCEDURE sp_fetch_product_colors(IN p_id VARCHAR(36))
BEGIN SELECT sku AS color_name, '' AS hex_code, JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]')) AS image_url FROM product_variant WHERE product_id = p_id LIMIT 5; END $$

DROP PROCEDURE IF EXISTS sp_fetch_product_specs $$
CREATE PROCEDURE sp_fetch_product_specs(IN p_id VARCHAR(36))
BEGIN SELECT 'Brand' AS spec_key, COALESCE(p.brand, 'N/A') AS spec_value FROM product p WHERE p.id = p_id; END $$

DROP PROCEDURE IF EXISTS sp_fetch_product_reviews $$
CREATE PROCEDURE sp_fetch_product_reviews(IN p_id VARCHAR(36))
BEGIN SELECT '' AS user_name, 5 AS rating, 'Great product!' AS comment_text, CURDATE() AS review_date WHERE 1=0; END $$

-- ===================== CART (Catalog layer) =====================
DROP PROCEDURE IF EXISTS sp_fetch_cart $$
CREATE PROCEDURE sp_fetch_cart(IN p_uid VARCHAR(36))
BEGIN SELECT ci.id AS cart_item_id, pv.product_id, ci.qty AS quantity, ci.selected_size, ci.selected_color
  FROM cart_item ci JOIN cart c ON c.id = ci.cart_id JOIN product_variant pv ON pv.id = ci.variant_id
  WHERE c.customer_id = p_uid AND c.status = 'active'; END $$

DROP PROCEDURE IF EXISTS sp_add_cart_item $$
CREATE PROCEDURE sp_add_cart_item(IN p_uid VARCHAR(36), IN p_pid VARCHAR(36), IN p_qty INT, IN p_size VARCHAR(50), IN p_color VARCHAR(50))
BEGIN DECLARE v_cart VARCHAR(36); DECLARE v_vid VARCHAR(36);
  SELECT id INTO v_cart FROM cart WHERE customer_id = p_uid AND status = 'active' LIMIT 1;
  IF v_cart IS NULL THEN SET v_cart = UUID(); INSERT INTO cart (id, customer_id, status) VALUES (v_cart, p_uid, 'active'); END IF;
  SELECT id INTO v_vid FROM product_variant WHERE product_id = p_pid ORDER BY price LIMIT 1;
  INSERT INTO cart_item (id, cart_id, variant_id, qty, price, selected_size, selected_color) VALUES (UUID(), v_cart, v_vid, p_qty, 0, p_size, p_color);
  SELECT UUID() AS cart_item_id; END $$

DROP PROCEDURE IF EXISTS sp_delete_cart_item $$
CREATE PROCEDURE sp_delete_cart_item(IN p_id VARCHAR(36))
BEGIN DELETE FROM cart_item WHERE id = p_id; SELECT ROW_COUNT() AS affected_rows; END $$

DROP PROCEDURE IF EXISTS sp_clear_cart $$
CREATE PROCEDURE sp_clear_cart(IN p_uid VARCHAR(36))
BEGIN DELETE ci FROM cart_item ci JOIN cart c ON c.id = ci.cart_id WHERE c.customer_id = p_uid AND c.status = 'active'; SELECT ROW_COUNT() AS affected_rows; END $$

-- ===================== MERGE GUEST CART =====================
DROP PROCEDURE IF EXISTS sp_merge_guest_cart $$
CREATE PROCEDURE sp_merge_guest_cart(IN p_guest VARCHAR(36), IN p_cust VARCHAR(36))
BEGIN
  DECLARE v_guest_cart VARCHAR(36); DECLARE v_cust_cart VARCHAR(36);
  SELECT id INTO v_guest_cart FROM cart WHERE customer_id = p_guest AND status = 'active' LIMIT 1;
  SELECT id INTO v_cust_cart FROM cart WHERE customer_id = p_cust AND status = 'active' LIMIT 1;
  IF v_cust_cart IS NULL THEN SET v_cust_cart = UUID(); INSERT INTO cart (id, customer_id, status) VALUES (v_cust_cart, p_cust, 'active'); END IF;
  IF v_guest_cart IS NOT NULL THEN
    UPDATE ci SET ci.cart_id = v_cust_cart FROM cart_item ci WHERE ci.cart_id = v_guest_cart;
    UPDATE cart SET status = 'merged' WHERE id = v_guest_cart;
  END IF;
  SELECT ROW_COUNT() AS affected_rows; END $$

DELIMITER ;
