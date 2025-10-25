# How Admin Assigns Orders to Staff/Tailors - Complete Guide

## 📋 Overview

The admin can assign customer orders to tailors/staff members through two different order management pages.

---

## 🎯 Two Ways to Access Order Assignment

### Option 1: Regular Orders Page
**File:** `frontend/src/pages/admin/Orders.js`
**Route:** `/admin/orders`
- Shows orders with assigned staff
- View who is assigned (but no assignment functionality yet)

### Option 2: Enhanced Orders Page (RECOMMENDED)
**File:** `frontend/src/pages/admin/EnhancedOrders.js`
**Route:** `/admin/enhanced-orders` (if configured)
- ✅ Full assignment functionality
- ✅ Assignment modal
- ✅ Payment management
- ✅ Download invoices

---

## 🔄 How Assignment Works - Step by Step

### Step 1: Admin Logs In
```
URL: http://localhost:3000/admin
Email: admin@gmail.com
Password: Admin@123
```

### Step 2: Navigate to Orders Page
```
Click: Orders (in sidebar)
URL: /admin/orders or /admin/enhanced-orders
```

### Step 3: View Unassigned Orders
The orders table shows:
- Order ID
- Customer name & phone
- Garment type
- Status
- **Assigned To** column
  - If assigned: Shows tailor name with icon
  - If NOT assigned: Shows **"Assign"** button

### Step 4: Click "Assign" Button
When an order is not assigned, you'll see:
```
┌─────────────────────────┐
│ Assigned To             │
├─────────────────────────┤
│  [👤 Assign]            │  ← Click this button
└─────────────────────────┘
```

### Step 5: Assignment Modal Opens
A popup appears with:
```
╔════════════════════════════════╗
║  Assign Tailor                ║ [X]
╠════════════════════════════════╣
║  Order: #c315d7                ║
║  Customer: customer            ║
║                                ║
║  Select Tailor:                ║
║  [Dropdown ▼]                  ║
║    -- Select Tailor --         ║
║    Tailor 1 - tailor1@...      ║
║    Tailor 2 - tailor2@...      ║
║                                ║
║  [Cancel]  [Assign Tailor]     ║
╚════════════════════════════════╝
```

### Step 6: Select a Tailor
- Click the dropdown
- Choose a tailor from the list
- Tailors show: Name - Email

### Step 7: Click "Assign Tailor"
- Order is assigned to selected tailor
- ✅ Success message appears
- Modal closes automatically
- Order row updates to show tailor name

### Step 8: Confirmation
After assignment, the "Assigned To" column shows:
```
┌─────────────────────────┐
│ Assigned To             │
├─────────────────────────┤
│  👤 Tailor Name         │  ← Now shows assigned tailor
└─────────────────────────┘
```

---

## 💻 Technical Implementation

### Frontend Code

**File:** `frontend/src/pages/admin/EnhancedOrders.js`

#### 1. State Management
```javascript
const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
const [selectedTailor, setSelectedTailor] = useState('');
const [tailors, setTailors] = useState([]);
```

#### 2. Fetch Tailors on Page Load
```javascript
const fetchData = async () => {
  const tailorsRes = await axios.get('/api/users?role=Tailor');
  setTailors(Array.isArray(tailorsData.users) ? tailorsData.users : []);
};
```

#### 3. Open Assignment Modal
```javascript
// In the order row, if not assigned:
<button
  className="btn btn-sm btn-outline"
  onClick={() => {
    setSelectedOrderForAssign(order);  // Set selected order
    setShowAssignModal(true);          // Open modal
  }}
>
  <FaUserTie /> Assign
</button>
```

#### 4. Assignment Modal UI
```javascript
{showAssignModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Assign Tailor</h2>
      <p>Order: #{selectedOrderForAssign?._id?.slice(-6)}</p>
      <p>Customer: {selectedOrderForAssign?.customer?.name}</p>
      
      <select
        value={selectedTailor}
        onChange={(e) => setSelectedTailor(e.target.value)}
      >
        <option value="">-- Select Tailor --</option>
        {tailors.map(tailor => (
          <option key={tailor._id} value={tailor._id}>
            {tailor.name} - {tailor.email}
          </option>
        ))}
      </select>
      
      <button onClick={handleAssignTailor}>Assign Tailor</button>
    </div>
  </div>
)}
```

#### 5. Handle Assignment
```javascript
const handleAssignTailor = async () => {
  if (!selectedOrderForAssign || !selectedTailor) {
    toast.error('Please select a tailor');
    return;
  }

  try {
    // Call backend API
    await axios.put(`/api/orders/${selectedOrderForAssign._id}/assign`, {
      tailorId: selectedTailor
    });

    // Update local state
    setOrders(orders.map(order => 
      order._id === selectedOrderForAssign._id
        ? { 
            ...order, 
            assignedTailor: { 
              _id: selectedTailor, 
              name: tailors.find(t => t._id === selectedTailor)?.name 
            } 
          }
        : order
    ));

    toast.success('Tailor assigned successfully!');
    setShowAssignModal(false);
    setSelectedOrderForAssign(null);
    setSelectedTailor('');
  } catch (error) {
    toast.error('Failed to assign tailor');
  }
};
```

---

### Backend Code

**File:** `backend/routes/orders.js`

#### Assignment Endpoint
```javascript
router.put('/:id/assign', auth, allowRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const { tailorId } = req.body;
    
    // Update order with assigned tailor
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedTailor: tailorId },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});
```

---

## 📊 Database Schema

**Order Model** (`backend/models/Order.js`)

```javascript
{
  _id: ObjectId,
  customer: ObjectId (ref: 'Customer'),
  items: [...],
  status: String,
  totalAmount: Number,
  assignedTailor: ObjectId (ref: 'User'),  // ← Stores assigned tailor ID
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 User Roles

### Admin Can:
- ✅ View all orders
- ✅ Assign orders to any tailor
- ✅ Reassign orders
- ✅ Unassign orders

### Staff Can:
- ✅ View all orders
- ✅ Assign orders to tailors
- ✅ Manage assignments

### Tailor Can:
- ✅ View only their assigned orders
- ❌ Cannot assign orders to others

---

## 🔐 API Endpoints

```
GET  /api/orders                  - Get all orders
GET  /api/users?role=Tailor       - Get all tailors
PUT  /api/orders/:id/assign       - Assign order to tailor
```

**Assign Order Request:**
```json
PUT /api/orders/68fafe08917c88835ec315d7/assign
Headers: { Authorization: "Bearer <admin_token>" }
Body: {
  "tailorId": "68d1234567890abcdef12345"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "68fafe08917c88835ec315d7",
    "customer": {...},
    "status": "Order Placed",
    "assignedTailor": "68d1234567890abcdef12345",
    ...
  }
}
```

---

## 🎨 Visual Flow

```
┌─────────────────┐
│  Admin Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orders Page    │
│                 │
│  Order List:    │
│  ┌───────────┐  │
│  │ Order #1  │  │
│  │ [Assign]  │◄─┼─── Click "Assign"
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Assignment      │
│ Modal Opens     │
│                 │
│ Select Tailor:  │
│ [Dropdown ▼]    │◄──── Choose tailor
│                 │
│ [Assign Tailor] │◄──── Click button
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend API     │
│ Updates Order   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success!        │
│ Order now shows │
│ assigned tailor │
└─────────────────┘
```

---

## 🔧 How to Enable Assignment Feature

### Currently Using: Regular Orders Page
The current `/admin/orders` page shows assignments but doesn't have the modal.

### To Enable Full Assignment:

#### Option 1: Add Route to Enhanced Orders
**File:** `frontend/src/App.js` (or your router file)

```javascript
import EnhancedOrders from './pages/admin/EnhancedOrders';

// In routes:
<Route path="/admin/orders-manage" element={<EnhancedOrders />} />
```

#### Option 2: Replace Current Orders Page
Replace the import in your admin routes:
```javascript
// Change from:
import Orders from './pages/admin/Orders';

// To:
import Orders from './pages/admin/EnhancedOrders';
```

---

## ✅ Features in EnhancedOrders

1. **✅ Assign Tailors** - Modal with dropdown
2. **✅ Update Status** - Inline dropdown
3. **✅ Manage Payments** - Payment modal
4. **✅ Download Invoices** - Invoice button
5. **✅ Filter Orders** - By status, garment, payment
6. **✅ Search** - By customer, order ID

---

## 📝 Quick Start Guide

### For Admin:

1. **Login** → `admin@gmail.com` / `Admin@123`
2. **Go to Orders** → Click "Orders" in sidebar
3. **Find Unassigned Order** → Look for "Assign" button
4. **Click "Assign"** → Modal opens
5. **Select Tailor** → Choose from dropdown
6. **Click "Assign Tailor"** → Done!

### For Tailor:

1. **Login** → `tailor@gmail.com` / `Tailor@123`
2. **View Assigned Orders** → See only their orders
3. **Update Status** → Change order progress
4. **Complete Work** → Mark as Ready

---

## 🐛 Troubleshooting

### Problem: "No tailors in dropdown"
**Solution:**
- Make sure tailors are created in system
- Check: `/admin/staff` page
- Add tailors with role "Tailor"

### Problem: "Assign button not showing"
**Solution:**
- Make sure using EnhancedOrders page
- Check route configuration
- Verify admin permissions

### Problem: "Assignment fails"
**Solution:**
- Check backend is running (port 5000)
- Verify JWT token is valid
- Check console for errors

---

## 📚 Related Files

```
Frontend:
✅ frontend/src/pages/admin/EnhancedOrders.js  - Full features
✅ frontend/src/pages/admin/Orders.js           - Basic view
✅ frontend/src/pages/admin/Orders.css          - Styling

Backend:
✅ backend/routes/orders.js      - Order APIs
✅ backend/models/Order.js       - Order schema
✅ backend/middleware/auth.js    - Auth & roles
```

---

## 🎉 Summary

**Admin assigns orders to staff in 3 simple steps:**

1. **Click "Assign"** button on unassigned order
2. **Select Tailor** from dropdown in modal
3. **Click "Assign Tailor"** button

The system:
- ✅ Shows success message
- ✅ Updates order instantly
- ✅ Tailor can now see the order
- ✅ Admin can see who's assigned

**Easy, fast, and efficient!** 🚀

