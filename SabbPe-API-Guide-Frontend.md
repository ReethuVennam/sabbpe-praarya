# SabbPe Payment API Guide for Frontend

> **Base URL (UAT):** `https://pymntsuat.sabbpe.com`

---

## Table of Contents

1. [Overview](#overview)
2. [POST /sabbpe/v1/token](#1-post-sabbpev1token)
3. [POST /sabbpe/v1/initiate](#2-post-sabbpev1initiate)
4. [Callback & Redirect Handling](#3-callback--redirect-handling)
5. [Merchant Server-to-Server Callback](#4-merchant-server-to-server-callback)
6. [Error Responses](#5-error-responses)
7. [Complete Flow Summary](#6-complete-flow-summary)
8. [Enums & Reference](#7-enums--reference)

---

## Overview

The SabbPe payment flow has **two API calls from the frontend** followed by a **browser redirect** through the chosen payment gateway. After payment, the user is redirected back to your frontend with the result.

```
[Your Frontend]                  [SabbPe Backend]               [Payment Gateway]
     │                                  │                              │
     │── POST /v1/token ──────────────>│                              │
     │<── { sabbpe_token, ... } ───────│                              │
     │                                  │                              │
     │── POST /v1/initiate ───────────>│                              │
     │<── { payment_url, ... } ────────│                              │
     │                                  │                              │
     │ [Redirect browser to payment_url]─────────────────────────────>│
     │                                  │                              │
     │                                  │<── Gateway callback ────────│
     │<── HTTP 302 to /payment-result ─│                              │
     │    ?status=SUCCESS&txnid=...    │                              │
```

**Important:** There are two separate callback mechanisms:
1. **Browser redirect** → Your frontend receives query params (`status`, `txnid`, etc.) — you handle this
2. **Server-to-server POST** → SabbPe POSTs to your backend `merchant_callback_url` (configured per merchant) — your backend handles this

---

## 1. POST /sabbpe/v1/token

Generates a one-time authentication token valid for **15 minutes**. This token is required for the subsequent `/initiate` call.

### Request

```
POST /sabbpe/v1/token
Content-Type: application/json
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sabbpe_userid` | string | Yes | Merchant user ID provided during onboarding |
| `sabbpe_merchantid` | string | Yes | Merchant ID provided during onboarding |
| `sabbpe_password` | string | Yes | Merchant transaction password |
| `timestamp` | string | Yes | Current timestamp in `yyyy-MM-dd HH:mm:ss` format. Must be within ±5 minutes of server time |
| `merchant_order_ref` | string | Yes | Unique order reference from your system. Must be unique per transaction |

```json
{
  "sabbpe_userid": "DEMO_USER",
  "sabbpe_merchantid": "DEMOMERCH001",
  "sabbpe_password": "demo_password",
  "timestamp": "2026-07-31 14:30:00",
  "merchant_order_ref": "ORDER_20260731_001"
}
```

> **NOTE:** `merchant_order_ref` must be **unique across all transactions**. Reusing a value will return an error.

### Success Response (200)

```json
{
  "status": true,
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "sabbpe_token": "x9K2mP...base64encrypted...Lq7Rw==",
  "token_expiry_minutes": 15,
  "message": "Token generated successfully",
  "merchant_order_ref": "ORDER_20260731_001"
}
```

| Field | Type | Description |
|---|---|---|
| `status` | boolean | `true` on success |
| `transaction_id` | string | UUID of the master transaction (for reference/troubleshooting) |
| `sabbpe_token` | string | AES-encrypted token. **Store this** — you need it for `/initiate` |
| `token_expiry_minutes` | integer | Always `15` |
| `merchant_order_ref` | string | Echo of your request |

### Error Responses

| HTTP | Condition | Example `message` |
|---|---|---|
| 400 | Missing required field | `"Missing sabbpe_userid"` |
| 400 | Invalid timestamp format | `"Invalid timestamp format. Expected: yyyy-MM-dd HH:mm:ss"` |
| 400 | Timestamp drift > 5 min | `"Invalid timestamp. Only +/- 5 minutes from server time is allowed"` |
| 400 | Invalid credentials | `"Invalid merchant credentials"` |
| 400 | Duplicate order ref | `"merchant_order_ref already exists..."` |
| 500 | Backend/internal error | `"Token generation failed..."` |

All errors return:
```json
{
  "status": false,
  "message": "error description here"
}
```

---

## 2. POST /sabbpe/v1/initiate

Initiates a payment using the token from `/token`. Returns a `payment_url` that you must redirect the customer's browser to.

### Request

```
POST /sabbpe/v1/initiate
Content-Type: application/json
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sabbpe_token` | string | **Yes** | Token from `/token` response |
| `amount` | number | **Yes** | Payment amount (e.g. `100.50`) |
| `productinfo` | string | No | Product/service description |
| `frontend_url` | string | **Yes** | Your frontend's base URL for post-payment redirect. e.g. `https://your-site.com` |
| `encrypted_order_ref` | string | No | Custom encrypted ref for callback `txnid` param. If omitted, SabbPe generates one automatically |
| `customer` | object | **Yes** | Customer details (see below) |
| `split_payments` | object | No | Split payment mapping. Key = sub-merchant ID, Value = amount |
| `show_payment_mode` | string | No | Restrict visible payment modes. e.g. `"CC,DC,UPI,NB"` |

#### `customer` object

| Field | Type | Required | Description |
|---|---|---|---|
| `firstname` | string | **Yes** | Customer's first name |
| `email` | string | **Yes** | **Registered merchant email** (must match `client_profile.client_email`) |
| `phone` | string | **Yes** | **Registered merchant phone** (must match `client_profile.client_mobile`) |

> **CRITICAL:** `customer.email` and `customer.phone` must be the **merchant's registered account credentials** stored in `client_profile`, **not** the end-user's contact details. These are used for authentication, not for displaying customer info.

```json
{
  "sabbpe_token": "x9K2mP...base64encrypted...Lq7Rw==",
  "amount": 100.00,
  "productinfo": "Test Product",
  "frontend_url": "https://your-site.com",
  "encrypted_order_ref": "enc_abc123...",
  "customer": {
    "firstname": "John",
    "email": "merchant@example.com",
    "phone": "9876543210"
  },
  "split_payments": {
    "SUBMERCH001": 90.00,
    "SUBMERCH002": 10.00
  },
  "show_payment_mode": "CC,DC,UPI"
}
```

### Success Response (200)

```json
{
  "status": true,
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "merchant_order_ref": "ORDER_20260731_001",
  "payment_url": "https://pay.easebuzz.in/pay/...",
  "gateway": "EASEBUZZ",
  "txnid": "SBEBZ3F8A2B9C1D4E5F67890ABCDEF01",
  "initiation_status": "INITIATED",
  "message": "Payment initiated successfully"
}
```

| Field | Type | Description |
|---|---|---|
| `status` | boolean | `true` on success |
| `transaction_id` | string | Master transaction UUID |
| `merchant_order_ref` | string | Echo of your order reference |
| `payment_url` | string | **Redirect the customer's browser to this URL** immediately |
| `gateway` | string | Gateway used: `EASEBUZZ`, `NTTDATA`, or `MSWIPE` |
| `txnid` | string | Gateway-specific transaction ID |
| `initiation_status` | string | `INITIATED` or gateway-specific status code |
| `message` | string | Status message |

### What the frontend should do after receiving `payment_url`:

```javascript
// Immediately redirect the user's browser to the payment gateway
window.location.href = response.payment_url;
```

### Error Responses

| HTTP | Condition | Example `message` |
|---|---|---|
| 400 | Missing/invalid token | `"Missing sabbpe_token"`, `"Token already used or invalid"` |
| 400 | Token expired (> 15 min) | `"SabbPe token expired"` |
| 400 | Customer validation failed | `"Missing customer email"`, `"Invalid email or phone..."` |
| 400 | Missing frontend_url | `"Missing frontend_url in initiate payload"` |
| 503 | Gateway unreachable | `"Payment gateway temporarily unavailable..."` |
| 503 | Unsupported gateway | `"Gateway not supported: ..."` |
| 500 | Internal error | `"Payment initiation failed..."` |

---

## 3. Callback & Redirect Handling

After the customer completes (or cancels) payment on the gateway page, SabbPe processes the callback and **redirects the browser** back to your frontend.

### Redirect URL Format

```
{frontend_url}/payment-result?status={STATUS}&txnid={ENCRYPTED_ORDER_REF}[&error={ERROR_CODE}][&easepayid={EASEPAY_ID}]
```

Your frontend must have a route at `{frontend_url}/payment-result` that reads these query parameters.

### Query Parameters

| Param | Always Present | Values | Description |
|---|---|---|---|
| `status` | Yes | `SUCCESS`, `FAILED`, `CANCELLED`, `PENDING`, `ERROR` | Payment outcome |
| `txnid` | Yes | Encrypted string | Encrypted order reference to identify the transaction |
| `error` | No | `invalid_transaction`, `invalid_signature`, `callback_processing_failed` | Present only when `status=ERROR` |
| `easepayid` | No | string | Easebuzz payment ID (Easebuzz gateway only) |

### Example Redirect URLs

```
# Successful payment
https://your-site.com/payment-result?status=SUCCESS&txnid=enc_abc123...

# Failed payment
https://your-site.com/payment-result?status=FAILED&txnid=enc_abc123...

# Cancelled by user
https://your-site.com/payment-result?status=CANCELLED&txnid=enc_abc123...

# Callback processing error
https://your-site.com/payment-result?status=ERROR&txnid=enc_abc123...&error=invalid_signature
```

### Frontend Implementation

```javascript
// Route: /payment-result
// Parse query params on page load
const params = new URLSearchParams(window.location.search);
const status = params.get('status');   // SUCCESS | FAILED | CANCELLED | PENDING | ERROR
const txnid = params.get('txnid');     // Encrypted order reference
const error = params.get('error');     // Only for status=ERROR
const easepayid = params.get('easepayid');

switch (status) {
  case 'SUCCESS':
    showSuccessPage({ txnid });
    break;
  case 'FAILED':
    showFailurePage({ txnid, reason: 'Payment was declined' });
    break;
  case 'CANCELLED':
    showFailurePage({ txnid, reason: 'Payment was cancelled' });
    break;
  case 'PENDING':
    showPendingPage({ txnid });
    break;
  case 'ERROR':
    showErrorPage({ txnid, errorCode: error });
    break;
  default:
    showErrorPage({ reason: 'Unknown payment status' });
}
```

> **Note:** The `txnid` in the redirect URL is an **encrypted value** — treat it as an opaque string. You can pass it to your backend for decryption/verification using the `/sabbpe/v1/status` endpoint if needed.

### Payment Status Verification (Optional)

If you need to verify a payment's status server-side (e.g. before showing a success page), use:

```
POST /sabbpe/v1/status
Content-Type: application/json

{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
Response:
```json
{
  "status": true,
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_status": "SUCCESS",
  "amount": 100.00,
  "currency": "INR",
  "gateway": "EASEBUZZ",
  "message": "Status fetched successfully"
}
```

---

## 4. Merchant Server-to-Server Callback

In addition to the browser redirect, SabbPe sends an **asynchronous server-to-server POST** to your configured `merchant_callback_url` (set during onboarding in `client_profile`). This is a **backend-to-backend** call — your frontend does not directly handle this.

### Payload (POST JSON)

```json
{
  "gateway": "SABBPE",
  "master_transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "merchant_order_ref": "ORDER_20260731_001",
  "status": "SUCCESS",
  "amount": 100.00,
  "currency": "INR",
  "payment_completed_at": "2026-07-31T14:35:00",
  "payment_method": "UPI",
  "rrn": "123456789012"
}
```

### Your backend should:

1. Accept `POST` with `Content-Type: application/json`
2. Return HTTP `200` on successful receipt (any 2xx)
3. Look up the order using `merchant_order_ref` or `master_transaction_id`
4. Update your order status based on the `status` field
5. Be **idempotent** — handle duplicate callbacks gracefully (SabbPe may retry)

> **This callback arrives asynchronously**, potentially before or after the browser redirect. Your frontend should always show the payment-result page from the redirect query params, and your backend should reconcile with this callback.

---

## 5. Error Responses

### Common Error Pattern

All API error responses follow this structure:
```json
{
  "status": false,
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Validation error (check `message` for details) |
| `500` | Internal server error (retry or contact support) |
| `503` | Service unavailable (gateway down, retry later) |

---

## 6. Complete Flow Summary

```
Step 1: Frontend → POST /sabbpe/v1/token
         └─ Send: sabbpe_userid, sabbpe_merchantid, sabbpe_password, timestamp, merchant_order_ref
         └─ Receive: sabbpe_token (valid 15 min), transaction_id

Step 2: Frontend → POST /sabbpe/v1/initiate
         └─ Send: sabbpe_token, amount, frontend_url, customer{firstname, email, phone}
         └─ Receive: payment_url

Step 3: Frontend → Redirect browser to payment_url
         └─ window.location.href = payment_url

Step 4: User completes/cancels payment on gateway page

Step 5: Gateway → SabbPe backend (callback)
         └─ SabbPe processes, updates transaction

Step 6: SabbPe → Browser (HTTP 302 redirect)
         └─ Redirects to: {frontend_url}/payment-result?status=...&txnid=...

Step 7: Frontend → Parse query params, show result page

Step 8: (Async) SabbPe → Your backend (merchant_callback_url)
         └─ POST JSON with full transaction details
```

---

## 7. Enums & Reference

### Payment Status Values (redirect `status` param)

| Value | Meaning |
|---|---|
| `SUCCESS` | Payment completed successfully |
| `FAILED` | Payment was declined/failed |
| `CANCELLED` | User cancelled the payment |
| `PENDING` | Payment is still processing |
| `ERROR` | Callback processing error (check `error` param) |

### Transaction Statuses (server-side enum)

| Status | Description |
|---|---|
| `TOKEN_GENERATED` | Token created, awaiting initiation |
| `INITIATED` | Payment initiated, token consumed |
| `PENDING` | Payment processing |
| `SUCCESS` | Payment successful |
| `FAILED` | Payment failed |
| `CANCELLED` | Payment cancelled by user |
| `TIMEOUT` | Payment timed out |
| `EXPIRED` | Token/session expired |
| `REFUNDED` | Full refund processed |
| `PARTIALLY_REFUNDED` | Partial refund processed |

### Gateway Values

| Gateway | Description |
|---|---|
| `EASEBUZZ` | Easebuzz payment gateway |
| `NTTDATA` | NTT Data payment gateway |
| `MSWIPE` | Mswipe payment gateway |

---

## Important Notes

1. **Token is one-time use only** — Once used in `/initiate`, the `sabbpe_token` is consumed and cannot be reused. If `/initiate` fails, you must generate a new token.

2. **Token expires in 15 minutes** — Call `/initiate` immediately after `/token`.

3. **`merchant_order_ref` must be unique** — Each transaction needs a unique order reference. Reuse will cause a 400 error.

4. **Customer email/phone are merchant credentials** — The `customer.email` and `customer.phone` fields on `/initiate` must match the **merchant's registered account details**, not the end-user's contact info. This is an authentication check.

5. **`frontend_url` must be a valid base URL** — e.g. `https://your-site.com`. Do not include path segments. SabbPe appends `/payment-result` to it. The host `www.sabbpe.com` is blocked in UAT for security.

6. **`timestamp` must be within ±5 minutes of server time** — Use the current server time in `yyyy-MM-dd HH:mm:ss` format. Significant clock drift will cause token generation to fail.

7. **Always implement `/payment-result` as a dedicated route** — The callback redirect always targets `{frontend_url}/payment-result` with query parameters.

8. **Handle both redirect AND server callback** — The browser redirect gives the user immediate feedback. The server callback is your authoritative source of truth for order fulfillment.
