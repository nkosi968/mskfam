# Yoco Payment Gateway Integration

This project uses **Yoco's Checkout API** for secure online payments.

## Quick Setup

### 1. Get Yoco API Keys

1. Go to [Yoco Portal](https://portal.yoco.com/online/settings/api-keys)
2. Sign up or log in to your account
3. Navigate to **Online > Settings > API Keys**
4. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Environment Variables

**Backend (`backend/.env`):**

```env
YOCO_SECRET_KEY=sk_test_your_actual_secret_key_here
PORT=3001
```

**Frontend (`.env.local`):**

```env
VITE_BACKEND_URL=http://localhost:3001
```

For production, update `VITE_BACKEND_URL` to your deployed backend URL.

### 3. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

## Payment Flow

1. User browses products on `/shop`
2. User clicks on a product to view details
3. User clicks "Buy Now" button
4. Payment modal opens with product details
5. User clicks "Pay Now" in the modal
6. Frontend creates checkout session with backend
7. Backend creates checkout with Yoco API
8. User is redirected to Yoco's secure hosted payment page
9. User enters card details and completes payment
10. Payment confirmation webhook sent to backend
11. Order saved to Firebase Firestore

## Test Cards (Development)

| Card Number         | Result   |
| ------------------- | -------- |
| 4242 4242 4242 4242 | Success  |
| 4000 0000 0000 0002 | Declined |

- **Expiry Date:** Any future date
- **CVV:** Any 3 digits

## API Endpoints

### Payment Endpoints

**Create Checkout Session**

```
POST /api/payments/checkout
Body: {
  amount: number (in cents),
  currency: string (e.g., "ZAR"),
  metadata: object
}
Response: {
  success: boolean,
  id: string,
  redirectUrl: string,
  amount: number,
  currency: string
}
```

**Get Checkout Status**

```
GET /api/payments/checkout/:checkoutId
Response: {
  success: boolean,
  id: string,
  status: string,
  amount: number
}
```

**Refund Payment**

```
POST /api/payments/refund
Body: {
  chargeId: string,
  amountInCents?: number (optional for partial refund)
}
Response: {
  success: boolean,
  id: string
}
```

### Webhook Endpoints

**Yoco Webhook Handler**

```
POST /api/webhooks/yoco
Receives payment events from Yoco and saves orders to Firebase
```

**Register Webhook**

```
POST /api/webhooks/register
Body: {
  name: string,
  url: string (your webhook URL)
}
Response: {
  success: boolean,
  id: string,
  secret: string (SAVE THIS - only provided once!)
}
```

**List Webhooks**

```
GET /api/webhooks/list
Response: {
  success: boolean,
  webhooks: array
}
```

## File Structure

```
src/
├── services/
│   └── yocoService.ts          # Yoco API service
├── components/
│   └── PaymentModal.tsx         # Payment UI modal
└── pages/
    └── ProductDetail.tsx        # Product page with payment integration

backend/
├── server.js                    # Express server with payment endpoints
├── package.json                 # Dependencies
├── .env                         # Environment variables (add to .gitignore)
└── .env.example                 # Example env template
```

## Deployment

### Deploy Backend

**Option 1: Vercel**

1. Push code to GitHub
2. Connect backend folder to Vercel
3. Add environment variable `YOCO_SECRET_KEY`
4. Deploy

**Option 2: Railway**

1. Go to [railway.app](https://railway.app)
2. Create project from GitHub repo
3. Add `YOCO_SECRET_KEY` environment variable
4. Deploy

### Deploy Frontend

**Vercel:**

```bash
npm run build
vercel deploy
```

**Netlify:**

1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

**Update Frontend Config:**
After deploying backend, update `.env.local`:

```env
VITE_BACKEND_URL=https://your-deployed-backend-url.vercel.app
```

## Webhook Setup (Important for Production)

To receive payment confirmations via webhook:

1. Deploy your backend to get a public URL
2. Call the register webhook endpoint:

```bash
curl -X POST http://localhost:3001/api/webhooks/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Payment Webhook",
    "url": "https://your-deployed-backend.vercel.app/api/webhooks/yoco"
  }'
```

3. Save the returned `secret` value (only provided once!)
4. Use this secret to verify webhook signatures in production

## Troubleshooting

### Backend won't start

- Check Node.js version: `node --version` (must be >=18)
- Check port 3001 is not in use
- Verify firebase-admin is installed: `cd backend && npm install`

### "YOCO_SECRET_KEY not set"

- Check `.env` file in backend folder
- Verify you added the secret key from Yoco portal
- Restart backend server

### Frontend can't reach backend

- Check `VITE_BACKEND_URL` in `.env.local` matches your backend URL
- Verify backend is running on the specified port
- Check CORS configuration in `backend/server.js`

### Payment redirect loop

- Verify Yoco public key is configured
- Check browser console for errors
- Ensure backend URL is correct and accessible

## Security Notes

- **Never commit `.env` files** to version control
- Keep `YOCO_SECRET_KEY` private (server-side only)
- Always use HTTPS in production
- Validate webhook signatures in production
- PCI compliance is handled by Yoco (you never see card details)

## Support

- [Yoco Documentation](https://yoco.com/docs)
- [Yoco Portal](https://portal.yoco.com)
- Contact Yoco support via portal for API issues
