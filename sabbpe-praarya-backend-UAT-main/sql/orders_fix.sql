-- Complete orders stored procedures
-- Run ALL of this in MariaDB

DELIMITER $$

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
  SET v_order_id = CONCAT('ORD-', REPLACE(UUID(), '-', ''));
  INSERT INTO orders (id, customer_id, address_id, total_amount, status, payment_status, gateway_ref, meta)
  VALUES (v_order_id, p_customer_id, COALESCE(p_address_id, ''), 0, 'pending', 'pending',
          COALESCE(p_gateway_ref, ''),
          JSON_OBJECT('coupon', COALESCE(p_coupon_code, ''), 'paymentMethod', COALESCE(p_payment_method, '')));
  SELECT v_order_id AS order_id;
END $$

DROP PROCEDURE IF EXISTS sp_add_order_items $$
CREATE PROCEDURE sp_add_order_items(
  IN p_order_id VARCHAR(64),
  IN p_variant_id VARCHAR(36),
  IN p_quantity INT,
  IN p_price DECIMAL(12,2)
)
BEGIN
  INSERT INTO order_item (id, order_id, variant_id, qty, price, total)
  VALUES (UUID(), p_order_id, p_variant_id, p_quantity, p_price, p_price * p_quantity);
  UPDATE orders SET total_amount = (
    SELECT COALESCE(SUM(total), 0) FROM order_item WHERE order_id = p_order_id
  ) WHERE id = p_order_id;
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
         COALESCE(p.name, 'Product') AS product_name
  FROM orders o
  LEFT JOIN order_item oi ON oi.order_id = o.id
  LEFT JOIN product_variant pv ON pv.id = oi.variant_id
  LEFT JOIN product p ON p.id = pv.product_id
  WHERE o.id = p_order_id;
END $$

DROP PROCEDURE IF EXISTS sp_update_order_payment_status $$
CREATE PROCEDURE sp_update_order_payment_status(
  IN p_order_id VARCHAR(64),
  IN p_status VARCHAR(20),
  IN p_gateway_txn_id VARCHAR(200)
)
BEGIN
  UPDATE orders SET payment_status = LOWER(p_status) WHERE id = p_order_id;
  UPDATE payment SET status = LOWER(p_status), gateway_txn_id = COALESCE(p_gateway_txn_id, gateway_txn_id) WHERE order_id = p_order_id;
  SELECT id AS payment_id, order_id, status FROM payment WHERE order_id = p_order_id LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_create_payment $$
CREATE PROCEDURE sp_create_payment(
  IN p_order_id VARCHAR(64),
  IN p_method VARCHAR(20),
  IN p_gateway_txn_id VARCHAR(200),
  IN p_amount DECIMAL(12,2)
)
BEGIN
  DECLARE v_id VARCHAR(36);
  SET v_id = UUID();
  INSERT INTO payment(id, order_id, method, gateway_txn_id, amount, status, created_at)
  VALUES (v_id, p_order_id, p_method, p_gateway_txn_id, p_amount, 'pending', CURRENT_TIMESTAMP);
  SELECT v_id AS payment_id, p_order_id AS order_id, 'pending' AS status;
END $$

DELIMITER ;

-- Test: verify procedures exist
SHOW PROCEDURE STATUS WHERE Db = DATABASE() AND Name LIKE 'sp_%order%';
