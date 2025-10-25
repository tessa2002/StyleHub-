# Razorpay Integration Setup

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stylehub

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_RFTAqCvNfxyfF7
RAZORPAY_KEY_SECRET=xsIhRgfdWFDudNmxxiQXY1Fx

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following content:

```env
# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=rzp_test_RFTAqCvNfxyfF7

# API Configuration
REACT_APP_API_URL=http://localhost:5000
```

## Features Implemented

✅ **Backend Integration:**
- Razorpay SDK installed and configured
- Order creation endpoint (`/api/payments/create-order`)
- Payment verification endpoint (`/api/payments/verify-payment`)
- Webhook handling for payment events
- Automatic bill status update on successful payment

✅ **Frontend Integration:**
- Razorpay payment method added to payment modal
- Dynamic script loading for Razorpay checkout
- Payment flow with order creation and verification
- Error handling and user feedback
- Automatic UI updates after successful payment

## How It Works

1. **Customer selects Razorpay** as payment method
2. **Frontend creates order** via backend API
3. **Razorpay checkout opens** with configured options
4. **Customer completes payment** through Razorpay interface
5. **Backend verifies payment** signature for security
6. **Bill status updates** automatically to "Paid"
7. **UI refreshes** to show updated payment status

## Testing

The integration uses Razorpay test keys, so you can test with:
- Test card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV
- Any name

## Security Notes

- Payment signatures are verified on the backend
- Razorpay keys are stored in environment variables
- Webhook signatures are validated for security
- All payment data is handled securely through Razorpay












