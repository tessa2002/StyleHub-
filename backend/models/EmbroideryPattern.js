const mongoose = require('mongoose');

const EmbroideryPatternSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Floral', 'Monogram', 'Geometric', 'Traditional', 'Abstract'], default: 'Floral' },
  price: { type: Number, default: 0 },
  image: {
    filename: String,
    url: String,
    mimeType: String,
    size: Number
  },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EmbroideryPattern', EmbroideryPatternSchema);
