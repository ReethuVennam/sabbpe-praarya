-- ============================================
-- SAMPLE DATA FOR PRAARYA FOOD & BEVERAGE
-- Uses INSERT IGNORE to skip existing data
-- Run this in your MariaDB database
-- ============================================

-- Categories
INSERT IGNORE INTO category (id, name) VALUES
('cat-001', 'Soft Drinks'),
('cat-002', 'Fresh Juices'),
('cat-003', 'Coffee & Tea'),
('cat-004', 'Energy Drinks'),
('cat-005', 'Snacks'),
('cat-006', 'Desserts');

-- Products (Drinks)
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

-- Product Variants
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

-- Product-Category Mapping
INSERT IGNORE INTO product_category (product_id, category_id) VALUES
('prod-001', 'cat-001'),
('prod-002', 'cat-002'),
('prod-003', 'cat-003'),
('prod-004', 'cat-002'),
('prod-005', 'cat-002'),
('prod-006', 'cat-001'),
('prod-007', 'cat-004'),
('prod-008', 'cat-003'),
('prod-009', 'cat-002'),
('prod-010', 'cat-001'),
('prod-011', 'cat-005'),
('prod-012', 'cat-006'),
('prod-013', 'cat-005'),
('prod-014', 'cat-005'),
('prod-015', 'cat-006');

-- Sample Coupons
INSERT IGNORE INTO coupon (code, discount_type, discount_value, min_order_amount, active) VALUES
('WELCOME10', 'PERCENT', 10.00, 10.00, TRUE),
('FLAT5', 'AMOUNT', 5.00, 20.00, TRUE),
('SAVE20', 'PERCENT', 20.00, 50.00, TRUE);
