-- Orders stored procedures - run this in MariaDB

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_order $$
CREATE PROCEDURE sp_create_order(
  IN p_customer_id VARCHAR(36),
  IN p_address_id VARCHAR(36),
  IN p_coupon_code VARCHAR(40),
  IN p_payment_method VARCHAR(20)
)
BEGIN
  DECLARE v_order_id VARCHAR(64);
  SET v_order_id = CONCAT('ORD-', REPLACE(UUID(), '-', ''));
  INSERT INTO orders (id, customer_id, address_id, total_amount, status, payment_status, meta)
  VALUES (v_order_id, p_customer_id, IFNULL(p_address_id, ''), 0, 'pending', 'pending',
          JSON_OBJECT('coupon', IFNULL(p_coupon_code, ''), 'paymentMethod', IFNULL(p_payment_method, 'SABBPE')));
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
  IF EXISTS (SELECT 1 FROM product_variant WHERE id = p_variant_id) THEN
    INSERT INTO order_item (id, order_id, variant_id, qty, price, total)
    VALUES (UUID(), p_order_id, p_variant_id, p_quantity, p_price, p_price * p_quantity);
    UPDATE orders SET total_amount = (
      SELECT COALESCE(SUM(total), 0) FROM order_item WHERE order_id = p_order_id
    ) WHERE id = p_order_id;
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_get_orders $$
CREATE PROCEDURE sp_get_orders(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT id AS order_id, total_amount, status, payment_status, created_at
  FROM orders WHERE customer_id = p_customer_id ORDER BY created_at DESC;
END $$

CREATE OR REPLACE PROCEDURE sp_get_order_detail(IN p_order_id VARCHAR(64))
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

DELIMITER ;
