# BuyGlimmer Backend API Contract

**Base URL:** `https://<host>:8080/api/v1`

**Content-Type:** `application/json`

**Note:** All endpoints use HTTP **POST** exclusively. Request/response bodies follow a universal wrapper pattern (see below). No path variables, query params, or custom headers are used — everything goes in the body.

---

## Common Wrappers

### Request Wrapper

```json
{
  "token": "bgm_xxx...",
  "requestId": "optional-client-correlation-id",
  "data": { ... }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `token` | string | Yes (auth'd endpoints) | JWT bearer token prefixed with `bgm` |
| `requestId` | string | No | Client-supplied correlation ID; auto-generated if omitted |
| `data` | object | Yes | The actual request payload (type varies per endpoint) |

### Response Wrapper

```json
{
  "requestId": "xxx",
  "status": "SUCCESS",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `requestId` | string | Echoes or generates the correlation ID |
| `status` | string | `"SUCCESS"` or `"FAILED"` |
| `message` | string | Human-readable status |
| `data` | object / array / null | The actual response payload |

### Error Response (validation / exceptions)

```json
{
  "timestamp": "2025-01-01T00:00:00+05:30",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": ["field1: must not be blank", "field2: must be a valid email"]
}
```

### Auth Notes

- Non-auth endpoints (Register, Login, Forgot Password, Reset Password) do **not** require a token in the wrapper.
- All other endpoints marked **"Auth: Yes"** require a valid token in the `token` field. The server asserts the token belongs to the `customerId` in the payload.

---

## 1. Auth — `/api/v1/auth`

### 1.1 Register
```
POST /api/v1/auth/register
Auth: No
```

**Request (`data`):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "phone": "9876543210"
}
```

| Field | Type | Constraints |
|---|---|---|
| `name` | string | `@NotBlank` |
| `email` | string | `@Email`, `@NotBlank` |
| `password` | string | `@NotBlank` |
| `phone` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "token": "bgm_abc123...",
  "user": {
    "customerId": "CUST001",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "status": 1,
    "createdAt": "2025-07-30T12:00:00"
  }
}
```

---

### 1.2 Login
```
POST /api/v1/auth/login
Auth: No
```

**Request (`data`):**
```json
{
  "email": "john@example.com",
  "password": "securePass123",
  "guestId": "GUEST_xxx"
}
```

| Field | Type | Constraints |
|---|---|---|
| `email` | string | `@Email`, `@NotBlank` |
| `password` | string | `@NotBlank` |
| `guestId` | string | Optional; for merging guest cart after login |

**Response (`data`):** Same as Register — `AuthResponse` with `token` + `user`.

---

### 1.3 Forgot Password
```
POST /api/v1/auth/forgot-password
Auth: No
```

**Request (`data`):**
```json
{
  "email": "john@example.com"
}
```

| Field | Type | Constraints |
|---|---|---|
| `email` | string | `@Email`, `@NotBlank` |

**Response (`data`):**
```json
{
  "resetToken": "xyz_reset_token",
  "expiresInSeconds": 3600
}
```

---

### 1.4 Reset Password
```
POST /api/v1/auth/reset-password
Auth: No
```

**Request (`data`):**
```json
{
  "email": "john@example.com",
  "resetToken": "xyz_reset_token",
  "newPassword": "newSecurePass456"
}
```

| Field | Type | Constraints |
|---|---|---|
| `email` | string | `@Email`, `@NotBlank` |
| `resetToken` | string | `@NotBlank` |
| `newPassword` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "message": "Password reset successful"
}
```

---

## 2. User Profile — `/api/v1/user`

### 2.1 Get Profile
```
POST /api/v1/user/profile
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "customerId": "CUST001",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "status": 1,
  "createdAt": "2025-07-30T12:00:00"
}
```

---

### 2.2 Update Profile
```
POST /api/v1/user/update
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "name": "John Updated",
  "email": "john_new@example.com",
  "mobile": "9876543211"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `name` | string | `@NotBlank` |
| `email` | string | `@Email`, `@NotBlank` |
| `mobile` | string | `@NotBlank` |

**Response (`data`):** `UserProfileResponse` (same as get profile).

---

## 3. Address — `/api/v1/address`

### 3.1 Add Address
```
POST /api/v1/address/add
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "type": "HOME",
  "addressLine": "123 Main Street, Koramangala",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560034",
  "isDefault": true
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `type` | string | `@NotBlank` (e.g. HOME, WORK, OTHER) |
| `addressLine` | string | `@NotBlank` |
| `city` | string | `@NotBlank` |
| `state` | string | `@NotBlank` |
| `pincode` | string | `@NotBlank` |
| `isDefault` | boolean | Optional |

**Response (`data`):**
```json
{
  "addressId": "ADDR001",
  "customerId": "CUST001",
  "type": "HOME",
  "addressLine": "123 Main Street, Koramangala",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560034",
  "isDefault": true
}
```

---

### 3.2 List Addresses
```
POST /api/v1/address/list
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

**Response (`data`):** `Array<AddressResponse>`

---

## 4. Products — `/api/v1/products`

### 4.1 List Products
```
POST /api/v1/products/list
Auth: No
```

**Request (`data`):**
```json
{}
```

*(Empty object — no fields needed)*

**Response (`data`):** `Array<ProductSummaryResponse>`
```json
[
  {
    "productId": "PROD001",
    "name": "Cotton Kurta Set",
    "brand": "BuyGlimmer",
    "description": "Premium cotton kurta with churidar",
    "price": 1499.00,
    "mrp": 2499.00,
    "stock": 50,
    "imageUrl": "https://cdn.example.com/img/prod001.jpg"
  }
]
```

---

### 4.2 Product Detail
```
POST /api/v1/products/detail
Auth: No
```

**Request (`data`):**
```json
{
  "productId": "PROD001"
}
```

| Field | Type | Constraints |
|---|---|---|
| `productId` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "productId": "PROD001",
  "name": "Cotton Kurta Set",
  "brand": "BuyGlimmer",
  "description": "Premium cotton kurta with churidar",
  "price": 1499.00,
  "mrp": 2499.00,
  "stock": 50,
  "sku": "BG-KURTA-001",
  "imageUrl": "https://cdn.example.com/img/prod001.jpg"
}
```

---

### 4.3 Search Products
```
POST /api/v1/products/search
Auth: No
```

**Request (`data`):**
```json
{
  "keyword": "kurta"
}
```

| Field | Type | Constraints |
|---|---|---|
| `keyword` | string | `@NotBlank` |

**Response (`data`):** `Array<ProductSummaryResponse>`

---

## 5. Cart — `/api/v1/cart`

### 5.1 Add to Cart
```
POST /api/v1/cart/add
Auth: No
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "guestId": "GUEST_xxx",
  "productId": "PROD001",
  "variantId": "VAR001",
  "quantity": 2
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | Optional (use `guestId` for guest users) |
| `guestId` | string | Optional (use for guest users) |
| `productId` | string | `@NotBlank` |
| `variantId` | string | Optional |
| `quantity` | integer | `@NotNull`, `@Min(1)` |

**Response (`data`):**
```json
{
  "cartItemId": "CART_ITEM_001",
  "customerId": "CUST001",
  "productId": "PROD001",
  "variantId": "VAR001",
  "productName": "Cotton Kurta Set",
  "quantity": 2,
  "unitPrice": 1499.00,
  "lineTotal": 2998.00
}
```

---

### 5.2 Get Cart
```
POST /api/v1/cart/get
Auth: No
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "guestId": "GUEST_xxx"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | Optional |
| `guestId` | string | Optional |

**Response (`data`):** `Array<CartItemResponse>`

---

### 5.3 Update Cart Item
```
POST /api/v1/cart/update
Auth: No
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "guestId": "GUEST_xxx",
  "cartItemId": "CART_ITEM_001",
  "quantity": 3
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | Optional |
| `guestId` | string | Optional |
| `cartItemId` | string | `@NotBlank` |
| `quantity` | integer | `@NotNull`, `@Min(1)` |

**Response (`data`):** `null`

---

### 5.4 Remove from Cart
```
POST /api/v1/cart/remove
Auth: No
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "guestId": "GUEST_xxx",
  "cartItemId": "CART_ITEM_001"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | Optional |
| `guestId` | string | Optional |
| `cartItemId` | string | `@NotBlank` |

**Response (`data`):** `null`

---

## 6. Orders — `/api/v1/orders`

### 6.1 Create Order (from cart)
```
POST /api/v1/orders/create
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "addressId": "ADDR001",
  "couponCode": "SAVE10",
  "paymentMethod": "CARD",
  "items": [
    {
      "variantId": "VAR001",
      "quantity": 2,
      "price": 1499.00
    },
    {
      "variantId": "VAR002",
      "quantity": 1,
      "price": 899.00
    }
  ]
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `addressId` | string | `@NotBlank` |
| `couponCode` | string | Optional |
| `paymentMethod` | string | `@NotBlank` |
| `items` | array | `@NotEmpty` |
| `items[].variantId` | string | `@NotBlank` |
| `items[].quantity` | integer | `@NotNull`, `@Min(1)` |
| `items[].price` | decimal | `@NotNull`, `@DecimalMin(value="0.0", inclusive=false)` |

**Response (`data`):**
```json
{
  "orderId": "ORD001",
  "customerId": "CUST001",
  "totalAmount": 3897.00,
  "status": "CONFIRMED",
  "paymentStatus": "PENDING",
  "createdAt": "2025-07-30T12:00:00"
}
```

---

### 6.2 Instant Buy (single product)
```
POST /api/v1/orders/instant-buy
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "addressId": "ADDR001",
  "variantId": "VAR001",
  "quantity": 1,
  "price": 1499.00,
  "couponCode": "SAVE10",
  "paymentMethod": "UPI"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `addressId` | string | `@NotBlank` |
| `variantId` | string | `@NotBlank` |
| `quantity` | integer | `@NotNull`, `@Min(1)` |
| `price` | decimal | `@NotNull`, `@DecimalMin(value="0.0", inclusive=false)` |
| `couponCode` | string | Optional |
| `paymentMethod` | string | `@NotBlank` |

**Response (`data`):** `OrderSummaryResponse` (same as create order).

---

### 6.3 List Orders
```
POST /api/v1/orders/list
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

**Response (`data`):** `Array<OrderSummaryResponse>`

---

### 6.4 Order Detail
```
POST /api/v1/orders/detail
Auth: Yes
```

**Request (`data`):**
```json
{
  "orderId": "ORD001"
}
```

| Field | Type | Constraints |
|---|---|---|
| `orderId` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "orderId": "ORD001",
  "customerId": "CUST001",
  "totalAmount": 3897.00,
  "status": "CONFIRMED",
  "paymentStatus": "PENDING",
  "createdAt": "2025-07-30T12:00:00",
  "items": [
    {
      "orderItemId": "OI001",
      "variantId": "VAR001",
      "productName": "Cotton Kurta Set",
      "quantity": 2,
      "price": 1499.00,
      "total": 2998.00
    },
    {
      "orderItemId": "OI002",
      "variantId": "VAR002",
      "productName": "Silk Dupatta",
      "quantity": 1,
      "price": 899.00,
      "total": 899.00
    }
  ]
}
```

---

## 7. Payments — `/api/v1/payments`

### 7.1 Update Payment Status
```
POST /api/v1/payments/update-status
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "orderId": "ORD001",
  "status": "PAID",
  "gatewayTxnId": "TXN_abc123"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `orderId` | string | `@NotBlank` |
| `status` | string | `@NotBlank` |
| `gatewayTxnId` | string | Optional |

**Response (`data`):**
```json
{
  "orderId": "ORD001",
  "paymentStatus": "PAID"
}
```

---

### 7.2 SabbPe Payment Callback (Webhook)
```
POST /api/v1/payments/sabbpe/callback
Auth: No
Content-Type: application/json
```

**Request (RAW — NOT wrapped in ApiWrapperRequest):**
```json
{
  "merchant_order_ref": "ORD001",
  "payment_status": "COMPLETED"
}
```

| Field | Type | Description |
|---|---|---|
| `merchant_order_ref` | string | The order ID to update |
| `payment_status` | string | New payment status |

**Response:** Plain text — `"OK"` (200) or `"missing fields"` (400).

---

## 8. Coupons — `/api/v1/coupons`

### 8.1 Validate Coupon
```
POST /api/v1/coupons/validate
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "couponCode": "SAVE10",
  "orderAmount": 2998.00
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `couponCode` | string | `@NotBlank` |
| `orderAmount` | decimal | `@NotNull`, `@DecimalMin(value="0.0", inclusive=false)` |

**Response (`data`):**
```json
{
  "valid": true,
  "discountAmount": 299.80,
  "message": "Coupon applied successfully"
}
```

---

## 9. Delivery — `/api/v1/delivery`

### 9.1 Create Delivery
```
POST /api/v1/delivery/create
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "orderId": "ORD001",
  "courierName": "BlueDart",
  "trackingNumber": "BD123456789",
  "estimatedDeliveryDate": "2025-08-05",
  "destinationPincode": "560034",
  "serviceType": "EXPRESS",
  "dispatchDate": "2025-07-31"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `orderId` | string | `@NotBlank` |
| `courierName` | string | `@NotBlank` |
| `trackingNumber` | string | `@NotBlank` |
| `estimatedDeliveryDate` | string | Optional |
| `destinationPincode` | string | Optional |
| `serviceType` | string | Optional |
| `dispatchDate` | string | Optional |

**Response (`data`):**
```json
{
  "deliveryId": "DEL001",
  "orderId": "ORD001",
  "courierName": "BlueDart",
  "trackingNumber": "BD123456789",
  "status": "DISPATCHED",
  "currentLocation": "Bangalore Hub",
  "estimatedDeliveryDate": "2025-08-05",
  "updatedAt": "2025-07-31T10:00:00"
}
```

---

### 9.2 Delivery Detail
```
POST /api/v1/delivery/detail
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "deliveryId": "DEL001"
}
```

**Response (`data`):** `DeliveryResponse`

---

### 9.3 Update Delivery Status
```
POST /api/v1/delivery/update-status
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "deliveryId": "DEL001",
  "status": "IN_TRANSIT",
  "currentLocation": "Mumbai Hub",
  "remarks": "Package in transit"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `deliveryId` | string | `@NotBlank` |
| `status` | string | `@NotBlank` |
| `currentLocation` | string | Optional |
| `remarks` | string | Optional |

**Response (`data`):** `DeliveryResponse`

---

## 10. Returns — `/api/v1/returns`

### 10.1 Create Return
```
POST /api/v1/returns/create
Auth: Yes
```

**Request (`data`):**
```json
{
  "orderId": "ORD001",
  "customerId": "CUST001",
  "reason": "Size too large",
  "comments": "Please exchange for M size"
}
```

| Field | Type | Constraints |
|---|---|---|
| `orderId` | string | `@NotBlank` |
| `customerId` | string | `@NotBlank` |
| `reason` | string | `@NotBlank` |
| `comments` | string | Optional |

**Response (`data`):**
```json
{
  "returnId": "RET001",
  "orderId": "ORD001",
  "customerId": "CUST001",
  "reason": "Size too large",
  "status": "REQUESTED",
  "createdAt": "2025-08-01T14:00:00"
}
```

---

### 10.2 Return Detail
```
POST /api/v1/returns/detail
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "returnId": "RET001"
}
```

**Response (`data`):** `ReturnResponse`

---

### 10.3 List Returns
```
POST /api/v1/returns/list
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

**Response (`data`):** `Array<ReturnResponse>`

---

## 11. Refunds — `/api/v1/refunds`

### 11.1 Create Refund
```
POST /api/v1/refunds/create
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "returnId": "RET001",
  "paymentId": "PAY001",
  "amount": 1499.00,
  "reason": "Product returned - refund initiated"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `returnId` | string | `@NotBlank` |
| `paymentId` | string | `@NotBlank` |
| `amount` | decimal | `@NotNull`, `@DecimalMin(value="0.0", inclusive=false)` |
| `reason` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "refundId": "REF001",
  "returnId": "RET001",
  "paymentId": "PAY001",
  "amount": 1499.00,
  "status": "PROCESSING",
  "processedAt": "2025-08-02T10:00:00"
}
```

---

### 11.2 Refund Detail
```
POST /api/v1/refunds/detail
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "refundId": "REF001"
}
```

**Response (`data`):** `RefundResponse`

---

### 11.3 List Refunds
```
POST /api/v1/refunds/list
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

**Response (`data`):** `Array<RefundResponse>`

---

## 12. Invoices — `/api/v1/invoices`

### 12.1 Generate Invoice
```
POST /api/v1/invoices/generate
Auth: Yes
```

**Request (`data`):**
```json
{
  "orderId": "ORD001",
  "customerId": "CUST001",
  "billingEmail": "john@example.com"
}
```

| Field | Type | Constraints |
|---|---|---|
| `orderId` | string | `@NotBlank` |
| `customerId` | string | `@NotBlank` |
| `billingEmail` | string | `@Email`, `@NotBlank` |

**Response (`data`):**
```json
{
  "invoiceId": "INV001",
  "orderId": "ORD001",
  "invoiceNumber": "BG-INV-2025-001",
  "invoiceDate": "2025-07-30",
  "totalAmount": 3897.00,
  "discountAmount": 299.80,
  "status": "GENERATED",
  "lineItems": [
    {
      "lineItemId": "LI001",
      "productId": "PROD001",
      "productName": "Cotton Kurta Set",
      "quantity": 2,
      "unitPrice": 1499.00,
      "itemTotal": 2998.00,
      "discountAmount": 200.00
    },
    {
      "lineItemId": "LI002",
      "productId": "PROD002",
      "productName": "Silk Dupatta",
      "quantity": 1,
      "unitPrice": 899.00,
      "itemTotal": 899.00,
      "discountAmount": 99.80
    }
  ]
}
```

---

### 12.2 Invoice Detail
```
POST /api/v1/invoices/detail
Auth: Yes
```

**Request (`data`):**
```json
{
  "invoiceId": "INV001"
}
```

**Response (`data`):** `InvoiceDetailResponse`

---

### 12.3 Invoice by Order
```
POST /api/v1/invoices/by-order
Auth: Yes
```

**Request (`data`):**
```json
{
  "orderId": "ORD001"
}
```

**Response (`data`):** `InvoiceDetailResponse`

---

### 12.4 Email Invoice
```
POST /api/v1/invoices/email
Auth: Yes
```

**Request (`data`):**
```json
{
  "invoiceId": "INV001",
  "recipientEmail": "john@example.com"
}
```

| Field | Type | Constraints |
|---|---|---|
| `invoiceId` | string | `@NotBlank` |
| `recipientEmail` | string | `@Email`, `@NotBlank` |

**Response (`data`):**
```json
{
  "notificationId": "NOTIF001",
  "customerId": "CUST001",
  "toEmail": "john@example.com",
  "subject": "Invoice BG-INV-2025-001",
  "messageType": "INVOICE",
  "status": "SENT",
  "sentAt": "2025-07-30T12:05:00"
}
```

---

## 13. Email Notifications — `/api/v1/notifications/email`

### 13.1 Send Email
```
POST /api/v1/notifications/email/send
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001",
  "toEmail": "john@example.com",
  "subject": "Order Confirmation",
  "messageType": "ORDER_CONFIRMATION",
  "body": "<html>Your order has been confirmed!</html>"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | `@NotBlank` |
| `toEmail` | string | `@Email`, `@NotBlank` |
| `subject` | string | `@NotBlank` |
| `messageType` | string | `@NotBlank` |
| `body` | string | `@NotBlank` |

**Response (`data`):**
```json
{
  "notificationId": "NOTIF002",
  "customerId": "CUST001",
  "toEmail": "john@example.com",
  "subject": "Order Confirmation",
  "messageType": "ORDER_CONFIRMATION",
  "status": "SENT",
  "sentAt": "2025-07-30T12:01:00"
}
```

---

### 13.2 Email History
```
POST /api/v1/notifications/email/history
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

**Response (`data`):** `Array<EmailNotificationResponse>`

---

## 14. Wishlist — `/api/v1/wishlist`

### 14.1 List Wishlist
```
POST /api/v1/wishlist/list
Auth: Yes
```

**Request (`data`):**
```json
{
  "customerId": "CUST001"
}
```

| Field | Type | Constraints |
|---|---|---|
| `customerId` | string | Optional |

**Response (`data`):** `Array<ProductResponse>`
```json
[
  {
    "id": "PROD001",
    "name": "Cotton Kurta Set",
    "price": 1499.00,
    "category": "Ethnic Wear",
    "images": ["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"],
    "description": "Premium cotton kurta with churidar",
    "sizes": ["S", "M", "L", "XL"],
    "colors": [
      { "name": "Royal Blue", "hex": "#4169E1", "image": "https://cdn.example.com/blue.jpg" },
      { "name": "Maroon", "hex": "#800000", "image": "https://cdn.example.com/maroon.jpg" }
    ],
    "specs": {
      "Fabric": "Cotton",
      "Fit": "Regular",
      "Occasion": "Casual"
    },
    "reviews": [
      { "user": "Priya S.", "rating": 5, "comment": "Excellent quality!", "date": "2025-07-15" }
    ]
  }
]
```

---

### 14.2 Toggle Wishlist (Add / Remove)
```
POST /api/v1/wishlist/toggle
Auth: Yes
```

**Request (`data`):**
```json
{
  "productId": "PROD001",
  "customerId": "CUST001"
}
```

| Field | Type | Constraints |
|---|---|---|
| `productId` | string | `@NotBlank` |
| `customerId` | string | Optional |

**Response (`data`):** `Array<ProductResponse>` — the updated wishlist after toggling.

---

## Appendix: Complete Endpoint Index

| # | Path | Auth | Description |
|---|---|---|---|
| 1 | `/api/v1/auth/register` | No | Register new user |
| 2 | `/api/v1/auth/login` | No | Login |
| 3 | `/api/v1/auth/forgot-password` | No | Request password reset |
| 4 | `/api/v1/auth/reset-password` | No | Complete password reset |
| 5 | `/api/v1/user/profile` | Yes | Get user profile |
| 6 | `/api/v1/user/update` | Yes | Update user profile |
| 7 | `/api/v1/address/add` | Yes | Add address |
| 8 | `/api/v1/address/list` | Yes | List addresses |
| 9 | `/api/v1/products/list` | No | List all products |
| 10 | `/api/v1/products/detail` | No | Get product detail |
| 11 | `/api/v1/products/search` | No | Search products |
| 12 | `/api/v1/cart/add` | No | Add to cart |
| 13 | `/api/v1/cart/get` | No | Get cart |
| 14 | `/api/v1/cart/update` | No | Update cart item |
| 15 | `/api/v1/cart/remove` | No | Remove from cart |
| 16 | `/api/v1/orders/create` | Yes | Create order |
| 17 | `/api/v1/orders/instant-buy` | Yes | Instant buy |
| 18 | `/api/v1/orders/list` | Yes | List orders |
| 19 | `/api/v1/orders/detail` | Yes | Order detail |
| 20 | `/api/v1/payments/update-status` | Yes | Update payment status |
| 21 | `/api/v1/payments/sabbpe/callback` | No | SabbPe webhook (raw JSON) |
| 22 | `/api/v1/coupons/validate` | Yes | Validate coupon |
| 23 | `/api/v1/delivery/create` | Yes | Create delivery |
| 24 | `/api/v1/delivery/detail` | Yes | Delivery detail |
| 25 | `/api/v1/delivery/update-status` | Yes | Update delivery status |
| 26 | `/api/v1/returns/create` | Yes | Create return |
| 27 | `/api/v1/returns/detail` | Yes | Return detail |
| 28 | `/api/v1/returns/list` | Yes | List returns |
| 29 | `/api/v1/refunds/create` | Yes | Create refund |
| 30 | `/api/v1/refunds/detail` | Yes | Refund detail |
| 31 | `/api/v1/refunds/list` | Yes | List refunds |
| 32 | `/api/v1/invoices/generate` | Yes | Generate invoice |
| 33 | `/api/v1/invoices/detail` | Yes | Invoice detail |
| 34 | `/api/v1/invoices/by-order` | Yes | Invoice by order |
| 35 | `/api/v1/invoices/email` | Yes | Email invoice |
| 36 | `/api/v1/notifications/email/send` | Yes | Send email |
| 37 | `/api/v1/notifications/email/history` | Yes | Email history |
| 38 | `/api/v1/wishlist/list` | Yes | List wishlist |
| 39 | `/api/v1/wishlist/toggle` | Yes | Toggle wishlist |

---

## Exception / Error Responses

| Exception | HTTP Status | Response Message |
|---|---|---|
| Validation errors (`MethodArgumentNotValidException`) | 400 | Semicolon-joined field errors |
| Custom `ApiException` | Variable | Exception message |
| Resource not found (`NoSuchElementException`) | 404 | Exception message |
| Duplicate / constraint violation (`DataIntegrityViolationException`) | 409 | "Duplicate or invalid data. Please use unique values." |
| Database error (`DataAccessException`) | 500 | "Database access error" |
| Unhandled exception | 500 | "Internal server error" |

All errors (except SabbPe callback) return the standard `ApiWrapperResponse` with `status: "FAILED"` and the error message in the `message` field. Validation errors additionally populate the `data` field with an `ApiErrorResponse` object containing `timestamp`, `status`, `error`, `message`, and `details`.
