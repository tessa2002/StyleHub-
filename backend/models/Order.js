const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  notes: String,
});

const measurementSnapshotSchema = new mongoose.Schema({
  height: Number,
  chest: Number,
  waist: Number,
  hips: Number,
  shoulder: Number,
  sleeve: Number,
  armLength: Number,
  legLength: Number,
  neck: Number,
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  mimeType: String,
  size: Number,
  category: { type: String, enum: ['Sketch', 'Fabric', 'Receipt', 'Other'], default: 'Other' },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [orderItemSchema],
  status: { type: String, enum: ['Pending', 'In Progress', 'Ready', 'Delivered', 'Cancelled'], default: 'Pending' },
  totalAmount: { type: Number, default: 0 },
  measurementSnapshot: measurementSnapshotSchema, // snapshot at order time
  orderType: { type: String, default: '' },
  itemType: { type: String, default: '' },
  assignedTailor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fabric: {
    source: { type: String, enum: ['shop', 'customer', 'none'], default: 'none' },
    fabricId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabric' },
    name: { type: String, default: '' },
    code: { type: String, default: '' },
    color: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'm' },
    unitPrice: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  customizations: {
    embroidery: {
      enabled: { type: Boolean, default: false },
      type: { type: String, enum: ['hand','machine','zardosi','aari','bead','thread'], default: 'machine' },
      placements: [{ type: String, enum: ['collar','sleeves','neckline','hem','full','custom'] }],
      pattern: { type: String, enum: ['floral','geometric','custom'], default: 'floral' },
      colors: [{ type: String }],
      notes: { type: String, default: '' },
      status: { type: String, enum: ['pending','complete'], default: 'pending' },
      pricing: {
        unitPrice: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
        total: { type: Number, default: 0 },
      }
    }
  },
  orderDate: { type: Date, default: Date.now },
  expectedDelivery: { type: Date, default: null },
  stage: { type: String, enum: ['Cutting', 'Stitching', 'Finishing', 'Ready'], default: 'Cutting' },
  notes: String,
  attachments: [attachmentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);