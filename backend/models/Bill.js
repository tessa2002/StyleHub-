const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Cash', 'Card', 'UPI'], required: true },
  reference: { type: String, default: '' },
  paidAt: { type: Date, default: Date.now },
}, { _id: false });

const billSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
  status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  payments: [paymentSchema],
}, { timestamps: true });

billSchema.methods.recomputeStatus = function () {
  if (this.amountPaid <= 0) this.status = 'Unpaid';
  else if (this.amountPaid >= this.amount) this.status = 'Paid';
  else this.status = 'Partial';
};

module.exports = mongoose.model('Bill', billSchema);