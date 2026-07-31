DELIMITER $$
DROP PROCEDURE IF EXISTS sp_add_address $$
CREATE PROCEDURE sp_add_address(IN p_customer_id VARCHAR(36), IN p_type VARCHAR(20), IN p_address_line TEXT, IN p_city VARCHAR(100), IN p_state VARCHAR(100), IN p_pincode VARCHAR(10), IN p_is_default BOOLEAN)
BEGIN
  DECLARE v_id VARCHAR(36);
  SET v_id = UUID();
  IF p_is_default THEN UPDATE address SET is_default = FALSE WHERE customer_id = p_customer_id; END IF;
  INSERT INTO address (id, customer_id, type, address_line, city, state, pincode, is_default)
  VALUES (v_id, p_customer_id, p_type, p_address_line, p_city, p_state, p_pincode, p_is_default);
  SELECT v_id AS address_id, p_customer_id AS customer_id, p_type AS type, p_address_line AS address_line, p_city AS city, p_state AS state, p_pincode AS pincode, p_is_default AS is_default;
END $$
DROP PROCEDURE IF EXISTS sp_get_addresses $$
CREATE PROCEDURE sp_get_addresses(IN p_customer_id VARCHAR(36))
BEGIN
  SELECT id AS address_id, customer_id, type, address_line, city, state, pincode, is_default
  FROM address WHERE customer_id = p_customer_id ORDER BY is_default DESC;
END $$
DELIMITER ;