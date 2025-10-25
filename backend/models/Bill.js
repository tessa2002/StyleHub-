const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Cash', 'Card', 'UPI'], required: true },
  reference: { type: String, default: '' },
  paidAt: { type: Date, default: Date.now },
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true, sparse: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Razorpay' },
  status: { type: String, enum: ['Unpaid', 'Partial', 'Paid', 'Pending'], default: 'Pending' },
  payments: [paymentSchema],
  paidAt: { type: Date },
}, { timestamps: true });

// Auto-generate bill number before saving
billSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billNumber = `BILL-${String(count + 1001).padStart(6, '0')}`;
  }
  next();
});

billSchema.methods.recomputeStatus = function () {
  if (this.amountPaid <= 0) this.status = 'Pending';
  else if (this.amountPaid >= this.amount) {
    this.status = 'Paid';
    if (!this.paidAt) this.paidAt = new Date();
  }
  else this.status = 'Partial';
};

module.exports = mongoose.model('Bill', billSchema);